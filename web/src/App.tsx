import React from 'react';
import VoucherRedeemCard from './components/VoucherRedeemCard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Velox-Onboard Portal</h1>
        <p className="text-sm text-gray-600">SaaS User Lifecycle Automation & Voucher Validation</p>
      </div>
      
      <VoucherRedeemCard />
    </div>
  );
}

export default App;
