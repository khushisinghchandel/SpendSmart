# User Interviews

To validate the problem space and refine the SpendSmart experience, I did three super quick 10-min chats with friends who use AI tools regularly. These aren’t perfect transcripts — just the gist and the parts they actually said out loud.

---

## Interview 1
* **Name / Role:** Mahima Patel, Junior Dev for a personal client  
* **Company Stage:** Building an app for a doctor (solo gig)

**Direct Quotes they said:**
* *“Honestly I use ChatGPT more for writing updates to my client than for actual coding… it’s kinda embarrassing.”*
* *“I think I’m paying like… idk… $50? Maybe? It just keeps renewing so I don’t check.”*
* *“Midjourney is literally a waste for me. Some months I don’t even open it once.”*

**The most surprising thing they said:**
I didn’t expect her **primary AI use** to be *writing messages to the doctor*, not coding. That threw me off because I assumed devs mostly pay for dev help.

**What it changed about your design:**
This is exactly why I added the "Primary Use Case" dropdown (Coding / Writing / Data / Research) to the SpendForm. The audit engine needs to know *how* they are using the tool, not just what they bought, so we can eventually recommend cheaper alternatives tailored to their actual daily tasks.

---

## Interview 2
* **Name / Role:** R.D., Aspiring SDE  
* **Company Stage:** Just personal projects, interview prep, experimenting

**Direct Quotes:**
* *“Bro I literally forgot I had the Claude subscription until my bank pinged me.”*
* *“Half the time I use AI it’s just to explain LeetCode problems like I’m five.”*
* *“I swear I’m gonna cancel Copilot every month and then I don’t. It’s like gym membership energy.”*

**The most surprising thing they said:**
He didn’t even remember half his subscriptions. It wasn’t “oh I waste money,” it was “oh... I forgot that existed.”

**What it changed about your design:**
This feedback drove the design of the Results Dashboard. Instead of just showing monthly savings, I added the "Current Annual" vs "Optimized Annual" metric cards. Showing someone that their "gym membership energy" is costing them $1,200 a year provides the exact visual shock value needed to get them to cancel.

---

## Interview 3
* **Name / Role:** A.S., Freelance Web Developer  
* **Company Stage:** Freelance

**Direct Quotes:**
* *“I use AI a lot when I'm exhausted. Like late night debugging? ChatGPT is my co-worker at that point.”*
* *“Pricing is confusing, man. These companies just quietly nudge you to the higher plan.”*
* *“I don’t think I waste money... but when you asked I realized I might actually? Maybe?”*

**The most surprising thing they said:**
They only realized they *might* be wasting money while talking to me. Before that, it just wasn’t something they questioned.

**What it changed about your design:**
This validated the need for the line-by-line Action Plan and the AI Executive Summary. Users need the math done for them. The design forces them to see a specific card that says, "Cancel Tool X, you already have Tool Y. Save $20/mo." It removes the guesswork from confusing vendor pricing.