    // import React, { useEffect, useRef } from "react";
    // import { useParams } from "react-router-dom";

    // const Room = () => {
    //     const { roomID } = useParams();

    //     const userVideo = useRef();
    //     const userStream = useRef();
    //     const partnerVideo = useRef();
    //     const peerRef = useRef();
    //     const webSocketRef = useRef();

    //     const openCamera = async () => {
    //         try {
    //             console.log("🎥 Requesting access to camera & microphone...");
    //             const devices = await navigator.mediaDevices.enumerateDevices();
    //             const cameras = devices.filter(d => d.kind === "videoinput");
    //             const audio = devices.filter(d => d.kind === "audioinput");

    //             const constraints = {
    //                 audio: true,
    //                 video: cameras[0] ? { deviceId: cameras[0].deviceId } : true,
    //             };
    //             console.log("📸 Media constraints prepared:", constraints);

    //             const stream = await navigator.mediaDevices.getUserMedia(constraints);
    //             console.log("✅ Got local media stream!");
    //             return stream;
    //         } catch (err) {
    //             console.error("❌ Error accessing media devices:", err);
    //         }
    //     };

    //     useEffect(() => {
    //         console.log("🏁 Starting Room Setup...");
    //         openCamera().then((stream) => {
    //             console.log("📷 Setting up local video...");
    //             userVideo.current.srcObject = stream;
    //             userStream.current = stream;
    //             console.log("🎬 Local stream assigned to video element!");

    //             const socket = new WebSocket(`ws://localhost:8000/join?roomID=${roomID}`);
    //             webSocketRef.current = socket;

    //             console.log("🌐 Connecting to WebSocket server...");

    //             socket.safeSend = function (message, callback) {
    //                 const waitForConnection = (cb, interval) => {
    //                     if (socket.readyState === 1) cb();
    //                     else setTimeout(() => waitForConnection(cb, interval), interval);
    //                 };
    //                 waitForConnection(() => {
    //                     socket.send(message);
    //                     if (callback) callback();
    //                 }, 100);
    //             };

    //             socket.addEventListener("open", () => {
    //                 console.log(`🟢 WebSocket connected! Room ID: ${roomID}`);
    //                 socket.send(JSON.stringify({ join: true }));
    //                 console.log("📨 Sent: { join: true } to server");
    //             });

    //             socket.addEventListener("message", async (e) => {
    //                 const message = JSON.parse(e.data);
    //                 console.log("📩 Received message from server:", message);

    //                 if (message.join) {
    //                     console.log("🔔 Another user joined. Time to call them!");
    //                     callUser();
    //                 }

    //                 if (message.offer) {
    //                     console.log("📜 Received offer from remote peer");
    //                     handleOffer(message.offer);
    //                 }

    //                 if (message.answer) {
    //                     console.log("📬 Received answer from peer!");

    //                     const desc = new RTCSessionDescription(message.answer);

    //                     if (peerRef.current.signalingState === "have-local-offer") {
    //                         try {
    //                             await peerRef.current.setRemoteDescription(desc);
    //                             console.log("✅ Remote SDP answer set successfully");
    //                         } catch (err) {
    //                             console.error("❌ Failed to set remote SDP answer:", err);
    //                         }
    //                     } else {
    //                         console.warn("⚠️ Unexpected state when receiving answer:", peerRef.current.signalingState);
    //                     }
    //                 }

    //                 if (message.iceCandidate) {
    //                     console.log("🌍 Received ICE Candidate from peer");
    //                     try {
    //                         await peerRef.current.addIceCandidate(message.iceCandidate);
    //                         console.log("✅ ICE candidate added!");
    //                     } catch (err) {
    //                         console.error("❌ Failed to add ICE candidate:", err);
    //                     }
    //                 }
    //             });
    //         });
    //     },[roomID]);

    //     const handleOffer = async (offer) => {
    //         console.log("🛬 Handling incoming offer...");
    //         peerRef.current = createPeer();

    //         await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    //         console.log("📥 Remote offer set");

    //         userStream.current.getTracks().forEach(track => {
    //             peerRef.current.addTrack(track, userStream.current);
    //             console.log(`🎙️ Added track: ${track.kind}`);
    //         });

    //         const answer = await peerRef.current.createAnswer();
    //         await peerRef.current.setLocalDescription(answer);
    //         console.log("📦 Created and set local SDP answer");

    //         webSocketRef.current.send(JSON.stringify({ answer: peerRef.current.localDescription }));
    //         console.log("📤 Sent answer to remote peer");
    //     };

    //     const callUser = () => {
    //         console.log("📞 Initiating call to peer...");
    //         peerRef.current = createPeer();

    //         userStream.current.getTracks().forEach(track => {
    //             peerRef.current.addTrack(track, userStream.current);
    //             console.log(`🎧 Sending track: ${track.kind}`);
    //         });
    //     };

    //     const createPeer = () => {
    //         console.log("🔧 Creating new RTCPeerConnection...");
    //         const peer = new RTCPeerConnection({
    //             iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    //         });

    //         peer.onnegotiationneeded = handleNegotiationNeeded;
    //         peer.onicecandidate = handleIceCandidateEvent;
    //         peer.ontrack = handleTrackEvent;

    //         return peer;
    //     };

    //     const handleNegotiationNeeded = async () => {
    //         console.log("🧠 Negotiation needed – creating offer...");
    //         try {
    //             const offer = await peerRef.current.createOffer();
    //             await peerRef.current.setLocalDescription(offer);
    //             console.log("📤 Sent local offer to peer via WebSocket");

    //             webSocketRef.current.send(JSON.stringify({ offer: peerRef.current.localDescription }));
    //         } catch (err) {
    //             console.error("❌ Negotiation error:", err);
    //         }
    //     };

    //     const handleIceCandidateEvent = (e) => {
    //         if (e.candidate) {
    //             console.log("❄️ Found ICE Candidate – sending...");
    //             webSocketRef.current.send(JSON.stringify({ iceCandidate: e.candidate }));
    //         } else {
    //             console.log("⛔ No more ICE candidates");
    //         }
    //     };

    //     const handleTrackEvent = (e) => {
    //         console.log("📡 Received remote track – displaying partner's video");
    //         partnerVideo.current.srcObject = e.streams[0];
    //     };

    //     return (
    //         <div>
    //             <video ref={userVideo} autoPlay playsInline muted style={{ width: "50%" }} />
    //             <video ref={partnerVideo} autoPlay playsInline style={{ width: "50%" }} />
    //         </div>
    //     );
    // };

    // export default Room;



import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Room = () => {
  const { roomID } = useParams();
  const clientID = useRef(uuidv4()); // Unique client ID
  const userVideo = useRef();
  const userStream = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const webSocketRef = useRef();
  const [isConnected, setIsConnected] = useState(false);

  const openCamera = async () => {
    try {
      console.log("🎥 Requesting access to camera & microphone...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");
      const audio = devices.filter(d => d.kind === "audioinput");

      const constraints = {
        audio: audio[0] ? { deviceId: audio[0].deviceId } : false,
        video: cameras[0] ? { deviceId: cameras[0].deviceId } : false,
      };
      console.log("📸 Media constraints prepared:", constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Got local media stream!");
      return stream;
    } catch (err) {
      console.error("❌ Error accessing media devices:", err);
      return null;
    }
  };

  useEffect(() => {
    console.log("🏁 Starting Room Setup...");
    let socket;

    const setup = async () => {
      const stream = await openCamera();
      if (!stream) {
        console.error("Failed to get media stream");
        return;
      }

      console.log("📷 Setting up local video...");
      userVideo.current.srcObject = stream;
      userStream.current = stream;
      console.log("🎬 Local stream assigned to video element!");

      socket = new WebSocket(`ws://localhost:8000/join?roomID=${roomID}`);
      webSocketRef.current = socket;

      console.log("🌐 Connecting to WebSocket server...");

      socket.safeSend = function (message, callback) {
        const waitForConnection = (cb, interval) => {
          if (socket.readyState === 1) cb();
          else setTimeout(() => waitForConnection(cb, interval), interval);
        };
        waitForConnection(() => {
          socket.send(JSON.stringify({ ...message, clientID: clientID.current }));
          if (callback) callback();
        }, 100);
      };

      socket.addEventListener("open", () => {
        console.log(`🟢 WebSocket connected! Room ID: ${roomID}`);
        setIsConnected(true);
        socket.safeSend({ join: true });
        console.log("📨 Sent: { join: true } to server");
      });

      socket.addEventListener("message", async (e) => {
        let message;
        try {
          message = JSON.parse(e.data);
        } catch (err) {
          console.error("Invalid message format:", err);
          return;
        }
        console.log("📩 Received message from server:", message);

        // Ignore messages sent by this client
        if (message.clientID === clientID.current) {
          console.log("Ignoring self message");
          return;
        }

        if (message.join) {
          console.log("🔔 Another user joined. Time to call them!");
          callUser();
        }

        if (message.offer) {
          console.log("📜 Received offer from remote peer");
          await handleOffer(message.offer);
        }

        if (message.answer) {
          console.log("📬 Received answer from peer!");
          if (peerRef.current && peerRef.current.signalingState === "have-local-offer") {
            try {
              await peerRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
              console.log("✅ Remote SDP answer set successfully");
            } catch (err) {
              console.error("❌ Failed to set remote SDP answer:", err);
            }
          } else {
            console.warn("⚠️ Unexpected state when receiving answer:", peerRef.current?.signalingState);
          }
        }

        if (message.iceCandidate) {
          console.log("🌍 Received ICE Candidate from peer");
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(message.iceCandidate));
            console.log("✅ ICE candidate added!");
          } catch (err) {
            console.error("❌ Failed to add ICE candidate:", err);
          }
        }
      });

      socket.addEventListener("close", () => {
        console.log("🔴 WebSocket disconnected");
        setIsConnected(false);
      });
    };

    setup();

    return () => {
      console.log("🧹 Cleaning up...");
      if (userStream.current) {
        userStream.current.getTracks().forEach(track => track.stop());
      }
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, []);

  const handleOffer = async (offer) => {
    console.log("🛬 Handling incoming offer...");
    peerRef.current = createPeer();

    try {
      await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("📥 Remote offer set");

      userStream.current.getTracks().forEach(track => {
        peerRef.current.addTrack(track, userStream.current);
        console.log(`🎙️ Added track: ${track.kind}`);
      });

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      console.log("📦 Created and set local SDP answer");

      webSocketRef.current.safeSend({ answer: peerRef.current.localDescription });
      console.log("📤 Sent answer to remote peer");
    } catch (err) {
      console.error("❌ Error handling offer:", err);
    }
  };

  const callUser = () => {
    console.log("📞 Initiating call to peer...");
    peerRef.current = createPeer();

    userStream.current.getTracks().forEach(track => {
      peerRef.current.addTrack(track, userStream.current);
      console.log(`🎧 Sending track: ${track.kind}`);
    });
  };

  const createPeer = () => {
    console.log("🔧 Creating new RTCPeerConnection...");
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleIceCandidateEvent;
    peer.ontrack = handleTrackEvent;

    return peer;
  };

  const handleNegotiationNeeded = async () => {
    console.log("🧠 Negotiation needed – creating offer...");
    try {
      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);
      console.log("📤 Sent local offer to peer via WebSocket");

      webSocketRef.current.safeSend({ offer: peerRef.current.localDescription });
    } catch (err) {
      console.error("❌ Negotiation error:", err);
    }
  };

  const handleIceCandidateEvent = (e) => {
    if (e.candidate) {
      console.log("❄️ Found ICE Candidate – sending...");
      webSocketRef.current.safeSend({ iceCandidate: e.candidate });
    } else {
      console.log("⛔ No more ICE candidates");
    }
  };

  const handleTrackEvent = (e) => {
    console.log("📡 Received remote track – displaying partner's video");
    partnerVideo.current.srcObject = e.streams[0];
  };

  return (
    <div>
      <video ref={userVideo} autoPlay playsInline muted style={{ width: "50%" }} />
      <video ref={partnerVideo} autoPlay playsInline style={{ width: "50%" }} />
      <p>Connection Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
};

export default Room;