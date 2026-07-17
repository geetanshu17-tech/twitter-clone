"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import axiosInstance from "@/lib/axiosInstance";
import "@/i18n";
import { useTranslation } from "react-i18next";



export default function SubscriptionPage() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = useMemo(() => [
    {
      name: "FREE",
      price: "₹0",
      period: t('perForever'),
      limit: t('limit1'),
      features: [t('featBasic'), t('featStandard'), t('feat1Post')],
      color: "text-gray-400",
      bgColor: "bg-gray-800",
    },
    {
      name: "BRONZE",
      price: "₹100",
      period: t('perMonth'),
      limit: t('limit3'),
      features: [t('featPriority'), t('feat3Posts'), t('featAdFree')],
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
    },
    {
      name: "SILVER",
      price: "₹300",
      period: t('perMonth'),
      limit: t('limit5'),
      features: [t('feat247'), t('feat5Posts'), t('featVerified')],
      color: "text-slate-300",
      bgColor: "bg-slate-300/10",
    },
    {
      name: "GOLD",
      price: "₹1000",
      period: t('perMonth'),
      limit: t('limitUnlimited'),
      features: [t('featDedicated'), t('featUnlimited'), t('featEarlyAccess')],
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ], [t]);
  
  const currentPlan = ((user as any)?.subscriptionPlan || "FREE").toUpperCase();

  // Helper to load the Razorpay SDK dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // We now accept the planName AND the priceString so we know how much to charge
  const handleUpgrade = async (planName: string, priceString: string) => {
    if (!user) return;
    setLoadingPlan(planName);

    // Extract the number from strings like "₹100"
    const price = parseInt(priceString.replace(/\D/g, '')); 

    try {
      // 1. Hit the backend to create an order (also checks time restriction)
      const orderRes = await axiosInstance.post("/create-order", { amount: price });
      const orderData = orderRes.data;

      // 2. Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay failed to load. Please check your connection.");
        setLoadingPlan(null);
        return;
      }

      // 3. Configure Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Twitter Clone Premium",
        description: `Upgrade to ${planName} Plan`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 4. Payment Success - Verify Signature on Backend
            const verifyRes = await axiosInstance.post("/verify-payment", {
              ...response,
              email: user.email,
              newPlan: planName
            });

            // 5. Update UI state instantly
            setUser(verifyRes.data.user);
            localStorage.setItem("twitter-user", JSON.stringify(verifyRes.data.user));
            alert(`Success! You are now on the ${planName} plan.`);
          } catch (err: any) {
            alert(err.response?.data?.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: user.displayName,
          email: user.email,
        },
        theme: {
          color: "#3B82F6", // Matches your blue theme
        },
      };

      // Open the Razorpay Modal
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      // Handle if the user closes the modal without paying
      paymentObject.on('payment.failed', function (response: any) {
        alert("Payment failed or cancelled.");
      });

    } catch (error: any) {
      console.error("Order error:", error);
      alert(error.response?.data?.error || "Failed to initiate payment.");
    } finally {
      setLoadingPlan(null); // Stop spinner while modal is open
    }
  };

  // ... (Keep the rest of your UI return block exactly the same, just update the Button onClick)
  // Inside the map loop, update the Button onClick to pass the price:
  // onClick={() => handleUpgrade(plan.name, plan.price)}

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Navigation Header */}
        <div className="flex items-center mb-8 space-x-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="rounded-full p-2 h-10 w-10 hover:bg-zinc-800 text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-xl font-bold">{t("backToHome")}</span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("choosePremium")}</h1>
          <p className="text-gray-400">{t("unlockMore")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name;
            const isLoading = loadingPlan === plan.name;

            return (
              <Card 
                key={plan.name} 
                className={`bg-zinc-950 border ${isCurrentPlan ? 'border-blue-500' : 'border-zinc-800'} relative flex flex-col`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t("currentPlanBadge")}
                  </div>
                )}

                <CardHeader>
                  <CardTitle className={`text-xl font-bold ${plan.color} text-center`}>
                    {plan.name}
                  </CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-400 text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-center bg-zinc-900 py-2 rounded-md mb-6 border border-zinc-800">
                      <span className="font-semibold text-sky-400">{plan.limit}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-zinc-300">
                          <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    disabled={isCurrentPlan || !!loadingPlan}
                    onClick={() => handleUpgrade(plan.name, plan.price)}
                    className={`w-full font-bold rounded-full ${
                      isCurrentPlan 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isCurrentPlan ? t('active') : t('upgradeBtn')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}