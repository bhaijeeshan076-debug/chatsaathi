# ChatSaathi: setup

## Computer par chalao
1. Node.js (v18+) install karo
2. `npm install`
3. `.env.example` ko copy karke `.env` banao, key daalo (console.anthropic.com se)
4. `export $(cat .env | xargs) && npm start` (Windows: set ANTHROPIC_API_KEY=... phir npm start)
5. Browser me http://localhost:3000

## Online karo (free/sasta)
GitHub par upload -> render.com par "New Web Service" -> Environment me ANTHROPIC_API_KEY daalo.
Aapko https://xyz.onrender.com jaisa link milega. Phone me "Add to Home Screen" se app ban jata hai.

## Play Store ke liye
Website ko Android app banane ke liye Capacitor ya Bubblewrap (TWA) use karo.

## Kamai
- FREE_MSGS_PER_DAY se free limit set hoti hai
- Premium ke liye login + Razorpay/Play Billing jodna hoga (agla step)
