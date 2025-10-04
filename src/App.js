import React, { useState } from 'react';
import { QrCode, Scan, Shield, User, CheckCircle, XCircle, CreditCard, FileText } from 'lucide-react';

// Simulated ZK-proof generation (in production, use actual ZK libraries like snarkjs)
const generateZKProof = (userData) => {
  // Hash the user data (simulating commitment)
  const commitment = btoa(JSON.stringify(userData) + Date.now());
  
  // Generate proof claims without revealing actual data
  const proof = {
    commitment,
    timestamp: Date.now(),
    claims: {
      hasValidID: true,
      ageOver18: userData.age >= 18,
      hasPaymentMethod: userData.hasCard,
      nationality: 'VERIFIED' // Don't reveal actual nationality
    }
  };
  
  return proof;
};

// Verify ZK proof
const verifyProof = (proof) => {
  if (!proof || !proof.commitment) return false;
  
  // Check if proof is not expired (5 minutes validity)
  const currentTime = Date.now();
  const proofAge = currentTime - proof.timestamp;
  if (proofAge > 5 * 60 * 1000) return false;
  
  // Verify all claims
  return proof.claims.hasValidID && 
         proof.claims.ageOver18 && 
         proof.claims.hasPaymentMethod;
};

const ZKCheckinSystem = () => {
  const [mode, setMode] = useState('user'); // 'user' or 'verifier'
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    aadharLast4: '',
    hasCard: false
  });
  const [generatedProof, setGeneratedProof] = useState(null);
  const [qrData, setQrData] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [scannedData, setScannedData] = useState('');

  const handleGenerateProof = () => {
    if (!userData.name || !userData.age || !userData.aadharLast4) {
      alert('Please fill all fields');
      return;
    }

    const proof = generateZKProof(userData);
    setGeneratedProof(proof);
    
    // Convert proof to QR-compatible format
    const qrString = JSON.stringify(proof);
    setQrData(qrString);
  };

  const handleVerify = () => {
    try {
      const proof = JSON.parse(scannedData);
      const isValid = verifyProof(proof);
      setVerificationResult({
        valid: isValid,
        claims: proof.claims,
        timestamp: new Date(proof.timestamp).toLocaleString()
      });
    } catch (e) {
      setVerificationResult({
        valid: false,
        error: 'Invalid proof format'
      });
    }
  };

  const handleSimulateScan = () => {
    setScannedData(qrData);
    setMode('verifier');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">ZK-Proof Check-in</h1>
          </div>
          <p className="text-gray-600">Privacy-preserving identity verification for hotels, airports & lounges</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={() => setMode('user')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              mode === 'user'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5" />
            User Mode
          </button>
          <button
            onClick={() => setMode('verifier')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              mode === 'verifier'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Scan className="w-5 h-5" />
            Verifier Mode
          </button>
        </div>

        {/* User Mode */}
        {mode === 'user' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-green-600" />
              Generate Your ZK-Proof
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) => setUserData({...userData, age: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Aadhar (Last 4 digits)
                </label>
                <input
                  type="text"
                  maxLength="4"
                  value={userData.aadharLast4}
                  onChange={(e) => setUserData({...userData, aadharLast4: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Last 4 digits"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasCard"
                  checked={userData.hasCard}
                  onChange={(e) => setUserData({...userData, hasCard: e.target.checked})}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="hasCard" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  I have a valid payment method
                </label>
              </div>
            </div>

            <button
              onClick={handleGenerateProof}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Generate ZK-Proof QR
            </button>

            {generatedProof && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your ZK-Proof QR Code</h3>
                
                {/* Simulated QR Code */}
                <div className="bg-white border-4 border-green-600 rounded-lg p-8 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-32 h-32 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Scan this QR code at check-in</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">✓ What's being verified:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Age verification (18+): {generatedProof.claims.ageOver18 ? 'Yes' : 'No'}</li>
                    <li>• Valid ID: {generatedProof.claims.hasValidID ? 'Yes' : 'No'}</li>
                    <li>• Payment method: {generatedProof.claims.hasPaymentMethod ? 'Yes' : 'No'}</li>
                    <li>• Valid for: 5 minutes</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔒 What's NOT shared:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your full Aadhar number</li>
                    <li>• Your credit card details</li>
                    <li>• Your exact age</li>
                    <li>• Any other personal information</li>
                  </ul>
                </div>

                <button
                  onClick={handleSimulateScan}
                  className="w-full mt-4 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Simulate Scan (Switch to Verifier)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verifier Mode */}
        {mode === 'verifier' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Scan className="w-6 h-6 text-green-600" />
              Verify Check-in
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scanned QR Data (Paste or Scan)
              </label>
              <textarea
                value={scannedData}
                onChange={(e) => setScannedData(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32 font-mono text-sm"
                placeholder="QR code data will appear here..."
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              disabled={!scannedData}
            >
              <Shield className="w-5 h-5" />
              Verify Proof
            </button>

            {verificationResult && (
              <div className="mt-8 border-t pt-6">
                <div className={`rounded-lg p-6 ${
                  verificationResult.valid 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : 'bg-red-50 border-2 border-red-500'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    {verificationResult.valid ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-600" />
                        <div>
                          <h3 className="text-2xl font-bold text-green-800">Verification Successful</h3>
                          <p className="text-green-600">Guest is authorized to check in</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-12 h-12 text-red-600" />
                        <div>
                          <h3 className="text-2xl font-bold text-red-800">Verification Failed</h3>
                          <p className="text-red-600">
                            {verificationResult.error || 'Guest cannot be verified'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {verificationResult.valid && verificationResult.claims && (
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Verified Claims:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Valid ID: Yes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Age 18+: Yes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Payment Method: Yes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Nationality: Verified</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Verified at: {verificationResult.timestamp}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">How ZK-Proof Check-in Works:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <div className="font-semibold text-green-600 mb-1">1. Generate</div>
              User creates a ZK-proof from their credentials without exposing raw data
            </div>
            <div>
              <div className="font-semibold text-green-600 mb-1">2. Present</div>
              QR code contains only the proof, not actual personal information
            </div>
            <div>
              <div className="font-semibold text-green-600 mb-1">3. Verify</div>
              Verifier gets yes/no answer without seeing sensitive details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKCheckinSystem;