import React, { useState } from 'react';

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        '10 tender views per month',
        'Basic search and filters',
        'Email notifications',
        'Standard support',
        'Mobile access'
      ],
      limitations: [
        'Limited AI features',
        'No document management',
        'No team collaboration',
        'Basic analytics only'
      ],
      color: 'border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 999, yearly: 9990 },
      description: 'Great for small businesses',
      features: [
        '100 tender views per month',
        'Advanced search and filters',
        'Priority email notifications',
        'Document upload (up to 10 files)',
        'Basic analytics dashboard',
        'Mobile app access',
        'Email support'
      ],
      limitations: [
        'Limited AI analysis',
        'Basic team features (up to 3 members)',
        'Standard document processing'
      ],
      color: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 4999, yearly: 49990 },
      description: 'Most popular for growing teams',
      features: [
        'Unlimited tender views',
        'Full AI-powered analysis',
        'Advanced document management',
        'Team collaboration (up to 10 members)',
        'Bid calendar and reminders',
        'Custom filter templates',
        'Advanced analytics and insights',
        'Priority support',
        'API access',
        'Custom integrations'
      ],
      limitations: [
        'Standard compliance checking',
        'Basic competitor analysis'
      ],
      color: 'border-green-200 ring-2 ring-green-500',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Advanced compliance checking',
        'Detailed competitor analysis',
        'Custom AI model training',
        'White-label solution',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'On-premise deployment option',
        'Advanced security features',
        'Custom reporting'
      ],
      limitations: [],
      color: 'border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    }
  ];

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    if (price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const getDiscountPercentage = (monthly, yearly) => {
    if (typeof monthly === 'string' || typeof yearly === 'string') return 0;
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    if (plan.id !== 'free') {
      setShowPaymentModal(true);
    } else {
      // Handle free plan activation
      console.log('Activating free plan');
    }
  };

  const handlePayment = async () => {
    // Mock Razorpay integration
    const options = {
      key: 'rzp_test_1234567890', // Replace with actual Razorpay key
      amount: selectedPlan.price[billingCycle] * 100, // Amount in paise
      currency: 'INR',
      name: 'TenderMatch Pro',
      description: `${selectedPlan.name} Plan - ${billingCycle}`,
      image: '/logo192.png',
      handler: function (response) {
        console.log('Payment successful:', response);
        // Handle successful payment
        alert('Payment successful! Your subscription has been activated.');
        setShowPaymentModal(false);
      },
      prefill: {
        name: 'John Doe',
        email: 'john@example.com',
        contact: '+919999999999'
      },
      notes: {
        plan: selectedPlan.id,
        billing_cycle: billingCycle
      },
      theme: {
        color: '#1E40AF'
      }
    };

    // In a real app, you would load Razorpay script and create instance
    console.log('Would initiate Razorpay payment with options:', options);
    
    // Mock payment success for demo
    setTimeout(() => {
      alert('Payment successful! Your subscription has been activated.');
      setShowPaymentModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 mb-8">
          Select the perfect plan for your tender management needs
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="text-sm text-green-600 font-medium">Save up to 17%</span>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-sm border-2 ${plan.color} p-6 ${
              plan.popular ? 'transform scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(plan.price[billingCycle])}
                </span>
                {plan.price[billingCycle] !== 0 && typeof plan.price[billingCycle] === 'number' && (
                  <span className="text-gray-600 text-sm">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
              
              {billingCycle === 'yearly' && plan.price.monthly !== 0 && typeof plan.price.monthly === 'number' && (
                <div className="text-sm text-green-600 mb-4">
                  Save {getDiscountPercentage(plan.price.monthly, plan.price.yearly)}% annually
                </div>
              )}
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Features included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 text-sm">✓</span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Limitations:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-gray-400 text-sm">−</span>
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleSelectPlan(plan)}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${plan.buttonColor}`}
            >
              {plan.id === 'free' ? 'Get Started' : 
               plan.id === 'enterprise' ? 'Contact Sales' : 
               'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {plans.map(plan => (
                  <th key={plan.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { feature: 'Tender Views', values: ['10/month', '100/month', 'Unlimited', 'Unlimited'] },
                { feature: 'AI Analysis', values: ['Basic', 'Limited', 'Full', 'Advanced'] },
                { feature: 'Team Members', values: ['1', '3', '10', 'Unlimited'] },
                { feature: 'Document Storage', values: ['None', '10 files', 'Unlimited', 'Unlimited'] },
                { feature: 'API Access', values: ['No', 'No', 'Yes', 'Yes'] },
                { feature: 'Priority Support', values: ['No', 'Email', 'Yes', '24/7 Phone'] },
                { feature: 'Custom Integrations', values: ['No', 'No', 'Basic', 'Advanced'] },
                { feature: 'White Label', values: ['No', 'No', 'No', 'Yes'] }
              ].map((row, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.feature}
                  </td>
                  {row.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {value === 'Yes' ? (
                        <span className="text-green-500">✓</span>
                      ) : value === 'No' ? (
                        <span className="text-gray-400">−</span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            {
              question: 'Can I change my plan anytime?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
            },
            {
              question: 'Is there a free trial available?',
              answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, debit cards, UPI, and net banking through Razorpay.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.'
            },
            {
              question: 'Is my data secure?',
              answer: 'Absolutely. We use enterprise-grade security measures and comply with all data protection regulations.'
            }
          ].map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{faq.question}</h4>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Complete Your Purchase</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{selectedPlan.name} Plan</h4>
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} subscription
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(selectedPlan.price[billingCycle])}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatPrice(selectedPlan.price[billingCycle])}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="text-gray-900">
                    ₹{Math.round(selectedPlan.price[billingCycle] * 0.18).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      ₹{Math.round(selectedPlan.price[billingCycle] * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Pay with Razorpay
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay. Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;