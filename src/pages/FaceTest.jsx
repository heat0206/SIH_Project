import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, limit, onSnapshot, doc, setDoc, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import * as faceapi from 'face-api.js';
import Header from '../components/Header';

const FaceTest = () => {
    const [mode, setMode] = useState('enroll'); // 'enroll' or 'recognize'
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [enrollName, setEnrollName] = useState('');
    const [recognitionResult, setRecognitionResult] = useState('Waiting for face...');
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [currentTimestamp, setCurrentTimestamp] = useState(null);
    const [triggerStatus, setTriggerStatus] = useState(false);

    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // You need to put models in public/models folder
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                console.log("Models Loaded");
            } catch (e) {
                console.error("Error loading models:", e);
                alert("Error loading models. Make sure /public/models folder exists with model files.");
            }
        };
        loadModels();
    }, []);

    // Subscribe to latest ESP32 Image
    useEffect(() => {
        // Order by timestamp desc to get the NEWEST image
        const q = query(collection(db, "face_logs"), orderBy("timestamp", "desc"), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.forEach(doc => {
                const data = doc.data();
                // Check if this is a new image (simple check by timestamp or ID)
                // For now just update state
                setCurrentImage(data.imageUrl);

                if (mode === 'recognize' && modelsLoaded && faceMatcher) {
                    recognizeFace(data.imageUrl);
                }
            });
        });
        return () => unsubscribe();
    }, [mode, modelsLoaded, faceMatcher]);

    // Monitor Trigger Status
    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "config", "camera"), (doc) => {
            if (doc.exists()) {
                setTriggerStatus(doc.data().trigger);
            }
        });
        return () => unsubscribe();
    }, []);

    // Load Saved Faces for Recognition
    useEffect(() => {
        if (mode === 'recognize') {
            loadLabeledImages();
        }
    }, [mode]);

    const loadLabeledImages = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "face_descriptors"));
            const labeledDescriptors = [];

            querySnapshot.forEach(doc => {
                const data = doc.data();
                const descriptor = new Float32Array(Object.values(data.descriptor));
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(data.name, [descriptor]));
            });

            if (labeledDescriptors.length > 0) {
                setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
            }
        } catch (e) {
            console.error("Error loading faces:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!currentImage || !enrollName) return;
        setLoading(true);
        try {
            const img = await faceapi.fetchImage(currentImage);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                // Save descriptor to Firestore
                // We can't save Float32Array directly, convert to object/array
                const descriptorArray = Array.from(detection.descriptor);
                await setDoc(doc(db, "face_descriptors", enrollName), {
                    name: enrollName,
                    descriptor: descriptorArray,
                    timestamp: new Date()
                });
                alert(`Enrolled ${enrollName} successfully!`);
                setEnrollName('');
            } else {
                alert("No face detected in the image. Try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Enrollment failed.");
        } finally {
            setLoading(false);
        }
    };

    const recognizeFace = async (imageUrl) => {
        try {
            const img = await faceapi.fetchImage(imageUrl);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                setRecognitionResult(bestMatch.toString());
            } else {
                setRecognitionResult("No face detected");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleTriggerCapture = async () => {
        setTriggering(true);
        try {
            // Write to config/camera to trigger ESP32
            await setDoc(doc(db, "config", "camera"), {
                trigger: true,
                timestamp: new Date()
            });
            // We don't alert, just wait for the image to update via the subscription above
        } catch (e) {
            console.error("Trigger failed:", e);
            alert("Failed to trigger camera.");
        } finally {
            setTimeout(() => setTriggering(false), 2000); // Reset button state
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Face Recognition Test Lab 🧪</h1>

                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setMode('enroll')}
                            className={`px-4 py-2 rounded-lg font-medium ${mode === 'enroll' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        >
                            Enrollment Mode
                        </button>
                        <button
                            onClick={() => setMode('recognize')}
                            className={`px-4 py-2 rounded-lg font-medium ${mode === 'recognize' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                        >
                            Recognition Mode
                        </button>
                    </div>

                    {!modelsLoaded && <div className="text-red-500 mb-4">Loading AI Models... (Ensure models are in /public/models)</div>}

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">Live Feed (ESP32-CAM)</h3>
                                <button
                                    onClick={handleTriggerCapture}
                                    disabled={triggering}
                                    className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${triggering ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                >
                                    {triggering ? 'Requesting...' : '📸 Capture Now'}
                                </button>
                            </div>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                                {currentImage ? (
                                    <div className="relative w-full h-full">
                                        <img src={currentImage} alt="Stream" className="w-full h-full object-contain" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                            {currentTimestamp ? new Date(currentTimestamp.seconds * 1000).toLocaleString() : 'Unknown Time'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white">Waiting for image...</div>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                <span>Updates automatically.</span>
                                <span>Trigger Status: {triggerStatus ? 'PENDING (ESP32 has not picked up yet)' : 'IDLE'}</span>
                            </div>
                        </div>

                        <div>
                            {mode === 'enroll' ? (
                                <div>
                                    <h3 className="font-bold mb-4">Enroll New Face</h3>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Enter Name"
                                            value={enrollName}
                                            onChange={e => setEnrollName(e.target.value)}
                                            className="w-full border p-2 rounded"
                                        />
                                        <button
                                            onClick={handleEnroll}
                                            disabled={loading || !currentImage}
                                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Capture & Save Reference'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-bold mb-4">Recognition Result</h3>
                                    <div className={`p-6 rounded-lg text-center ${recognitionResult.includes('unknown') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                        <div className="text-2xl font-bold">{recognitionResult}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceTest;
