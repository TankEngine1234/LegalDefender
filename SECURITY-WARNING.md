# 🚨 URGENT: API KEY SECURITY

## ⚠️ YOU ACCIDENTALLY SHARED YOUR API KEY PUBLICLY

The key you shared in our conversation is now visible to anyone who can see this chat. 

**This means anyone can:**
- Use your $5 free credits
- Rack up charges if you add a credit card later
- Access OpenAI API with your account

---

## ✅ IMMEDIATE FIX (Do This Now - Takes 2 Minutes)

### Step 1: Revoke the Exposed Key

1. Go to: **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)**
2. Find this key in your list:
   - It might be named "Default" or show the first few characters: `sk-proj-2SiS...`
3. Click the **🗑️ trash icon** next to it
4. Confirm deletion
5. ✅ Key is now disabled - nobody can use it

### Step 2: Create a NEW Key

1. Same page → Click **"+ Create new secret key"**
2. (Optional) Name it "Contract Scanner Hackathon"
3. Click **"Create secret key"**
4. **Copy the key** - you'll only see it once!
5. **DO NOT share it anywhere:**
   - ❌ Don't post in chat
   - ❌ Don't commit to GitHub
   - ❌ Don't send in Discord/Slack
   - ❌ Don't share the HTML file with the key in it

### Step 3: Add Key to Your Local File

1. Download `contract-scanner-with-api.html` to your computer
2. Open in text editor (VS Code, Notepad++, etc.)
3. Find line 423:
   ```javascript
   const OPENAI_API_KEY = 'YOUR_OPENAI_KEY_HERE';
   ```
4. Replace with your NEW key:
   ```javascript
   const OPENAI_API_KEY = 'sk-proj-YOUR_NEW_KEY_FROM_STEP2';
   ```
5. **Save the file**
6. **Keep this file PRIVATE** - only on your computer

---

## 🧪 Test It Works

1. Open `contract-scanner-with-api.html` in your browser
2. Upload a real PDF contract
3. If it analyzes (takes 3-5 seconds), it's working! ✅
4. If it shows demo data instantly, check the browser console (F12) for errors

---

## 🛡️ Security Best Practices

### For Hackathon (Next 48 Hours)

**Safe approach:**
- Keep API key in local HTML file only
- Don't upload file to public GitHub
- Only demo from your laptop
- Key is visible in browser dev tools, but judges won't check

**Add rate limiting** (prevents abuse if someone does find the key):
```javascript
// Add this before the API call
let requestCount = 0;
const MAX_REQUESTS = 100;

if (requestCount >= MAX_REQUESTS) {
    alert('Demo limit reached');
    return null;
}
requestCount++;
```

### For Production (After Hackathon)

**Proper approach:**
1. Create a simple backend server (Node.js/Express)
2. Store API key in environment variable on server
3. Your HTML calls YOUR server, which calls OpenAI
4. Users never see the key

**Quick setup with Vercel (free):**
```javascript
// api/analyze.js (serverless function)
export default async function handler(req, res) {
    const apiKey = process.env.OPENAI_API_KEY; // Stored in Vercel dashboard
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
}
```

Then your frontend calls `/api/analyze` instead of OpenAI directly.

---

## 📊 Monitor Your Usage

Check if anyone is abusing your key:

1. Go to: [platform.openai.com/usage](https://platform.openai.com/usage)
2. Look for unexpected spikes in usage
3. If you see suspicious activity, revoke the key immediately

**Normal usage:**
- Each contract scan = ~$0.03
- 10 tests before demo = $0.30
- 5 live demos = $0.15
- **Total expected: $0.50 of your $5**

**Suspicious usage:**
- Hundreds of requests you didn't make
- Usage at times you weren't using the app
- If you see this, revoke key and create new one

---

## ✅ Checklist

- [ ] Revoke the exposed key (`sk-proj-2SiS...`)
- [ ] Create new key
- [ ] Add new key to local HTML file (line 423)
- [ ] Save file privately
- [ ] Test with real contract upload
- [ ] Monitor usage dashboard
- [ ] Never share key or file with key publicly

---

## 🆘 If Someone Already Used Your Credits

1. Check usage dashboard
2. If charges > $5 and you haven't added payment, OpenAI will just disable the key
3. If you added a credit card and see unexpected charges:
   - Contact OpenAI support: [help.openai.com](https://help.openai.com)
   - They may refund if it's clear the key was compromised

---

## 💡 What You Learned

**Golden rule:** API keys are like passwords
- Never share them publicly
- Never commit them to Git
- Use environment variables in production
- Revoke and regenerate if exposed

You caught it early, so you're fine! Just follow the steps above and you'll be secure. 🔒

Good luck with your hackathon! 🚀
