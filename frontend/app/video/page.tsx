'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

export default function VideoCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!appointmentId) {
      router.push('/appointments');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    initializeCall(token);

    return () => {
      cleanup();
    };
  }, [appointmentId, router]);

  // Timer
  useEffect(() => {
    if (!joined) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [joined]);

  const initializeCall = async (token: string) => {
    try {
      // Get video token from backend
      const res = await fetch('http://localhost:3001/api/video/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to get token');
      }

      const videoData = await res.json();

      // Initialize Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Join channel
      await client.join(videoData.appId, videoData.roomId, videoData.token, 0);

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localAudioTrackRef.current = audioTrack;
      localVideoTrackRef.current = videoTrack;

      // Play local video
      videoTrack.play('local-player');

      // Publish tracks
      await client.publish([audioTrack, videoTrack]);

      // Subscribe to remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          remoteVideoTrack?.play('remote-player');
        }

        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack?.play();
        }
      });

      client.on('user-unpublished', (user) => {
        // Remote user left or stopped publishing
      });

      startTimeRef.current = Date.now();
      setJoined(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Initialize call error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleMute = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(muted);
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.setEnabled(videoOff);
      setVideoOff(!videoOff);
    }
  };

  const endCall = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 60000);

      await fetch('http://localhost:3001/api/video/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId, actualDuration: duration })
      });

      cleanup();
      router.push('/appointments');
    } catch (error) {
      console.error('End call error:', error);
    }
  };

  const cleanup = async () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.close();
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-xs">[ INITIALIZING VIDEO CALL... ]</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scanlines min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="text-center">
          <div className="text-[#E61919] text-8xl mb-4">✕</div>
          <h1 className="text-4xl mb-4">CALL ERROR</h1>
          <div className="text-[#888888] mb-8">{error}</div>
          <button onClick={() => router.push('/appointments')} className="btn">
            BACK TO APPOINTMENTS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid md:grid-cols-2 gap-1 bg-[#333333] p-1">
        {/* Remote Video */}
        <div className="relative bg-[#121212]">
          <div id="remote-player" className="w-full h-full" />
          <div className="absolute top-4 left-4 bg-[#0A0A0A] bg-opacity-90 px-3 py-2 text-xs">
            [ REMOTE ]
          </div>
        </div>

        {/* Local Video */}
        <div className="relative bg-[#121212]">
          <div id="local-player" className="w-full h-full" />
          <div className="absolute top-4 left-4 bg-[#0A0A0A] bg-opacity-90 px-3 py-2 text-xs">
            [ LOCAL ]
          </div>
          {videoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]">
              <div className="text-[#888888]">[ VIDEO OFF ]</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#121212] border-t-2 border-[#333333] p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-xs text-[#888888]">
            DURATION: <span className="text-[#EAEAEA] font-mono">{formatDuration(callDuration)}</span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={toggleMute}
              className={`btn ${muted ? 'btn-primary' : ''}`}
            >
              {muted ? '🔇 UNMUTE' : '🔊 MUTE'}
            </button>

            <button
              onClick={toggleVideo}
              className={`btn ${videoOff ? 'btn-primary' : ''}`}
            >
              {videoOff ? '📹 VIDEO ON' : '📹 VIDEO OFF'}
            </button>

            <button
              onClick={endCall}
              className="btn border-[#E61919] text-[#E61919] hover:bg-[#E61919] hover:text-[#0A0A0A]"
            >
              END CALL
            </button>
          </div>

          <div className="text-xs text-[#888888]">
            ID: <span className="text-[#EAEAEA] font-mono text-[10px]">{appointmentId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
