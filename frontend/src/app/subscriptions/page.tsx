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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planName: string, priceString: string) => {
    if (!user) return;
    setLoadingPlan(planName);

    const price = parseInt(priceString.replace(/\D/g, '')); 

    try {
      const orderRes = await axiosInstance.post("/create-order", { amount: price });
      const orderData = orderRes.data;

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay failed to load. Please check your connection.");
        setLoadingPlan(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Twitter Clone Premium",
        description: `Upgrade to ${planName} Plan`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axiosInstance.post("/verify-payment", {
              ...response,
              email: user.email,
              newPlan: planName
            });

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
          color: "#3B82F6",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response: any) {
        alert("Payment failed or cancelled.");
      });

    } catch (error: any) {
      console.error("Order error:", error);
      alert(error.response?.data?.error || "Failed to initiate payment.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Navigation Header */}
        <div className="flex items-center mb-6 sm:mb-8 space-x-3 sm:space-x-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="rounded-full p-2 h-9 w-9 sm:h-10 sm:w-10 hover:bg-zinc-800 text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-lg sm:text-xl font-bold">{t("backToHome")}</span>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">{t("choosePremium")}</h1>
          <p className="text-gray-400 text-sm sm:text-base">{t("unlockMore")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.name;
            const isLoading = loadingPlan === plan.name;

            return (
              <Card 
                key={plan.name} 
                className={`bg-zinc-950 border ${isCurrentPlan ? 'border-blue-500' : 'border-zinc-800'} relative flex flex-col justify-between`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] sm:text-xs font-bold px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wide">
                    {t("currentPlanBadge")}
                  </div>
                )}

                <CardHeader className="pt-6 sm:pt-8">
                  <CardTitle className={`text-xl font-bold ${plan.color} text-center`}>
                    {plan.name}
                  </CardTitle>
                  <div className="text-center mt-2 sm:mt-4">
                    <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-400 text-xs sm:text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between pt-0">
                  <div>
                    <div className="text-center bg-zinc-900 py-2 rounded-md mb-4 sm:mb-6 border border-zinc-800">
                      <span className="font-semibold text-sky-400 text-sm">{plan.limit}</span>
                    </div>
                    
                    <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-xs sm:text-sm text-zinc-300">
                          <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    disabled={isCurrentPlan || !!loadingPlan}
                    onClick={() => handleUpgrade(plan.name, plan.price)}
                    className={`w-full font-bold rounded-full h-10 ${
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