import React, { useState } from 'react';

export const VoucherRedeemCard: React.FC = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5001/demo-velox-onboard/us-central1/redeem_voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Success! ${data.message} (${data.discountPercent}% discount applied).`);
      } else {
        setMessage(`Error: ${data.error || 'Failed to redeem voucher.'}`);
      }
    } catch (err) {
      setMessage('Network error connecting to redemption endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 my-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Redeem Your Welcome Voucher</h3>
      <p className="text-sm text-gray-600 mb-4">Enter your single-use code below to claim your discount.</p>

      <form onSubmit={handleRedeem} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. RACE-TEST-1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          {loading ? 'Redeeming...' : 'Redeem Voucher'}
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800">
          {message}
        </div>
      )}
    </div>
  );
};
export default VoucherRedeemCard;
