import type { Conversation } from "./types";

export const initialConversations: Conversation[] = [
	{
		id: "pediatric-consultation",
		name: "Dr. Sarah Chen",
		title: "Pediatric Consultation - Emma Johnson",
		status: "online",
		unread: 2,
		initials: "SC",
		messages: [
			{
				id: "pediatric-1",
				sender: "contact",
				author: "Dr. Chen",
				text: "Hi! I've reviewed Emma's growth chart from her last visit. Her weight percentile has dropped from 65th to 45th over the past 3 months. I'd like to discuss her nutrition plan.",
				timestamp: "10:02"
			},
			{
				id: "pediatric-2",
				sender: "user",
				author: "You",
				text: "Thank you, Dr. Chen. Emma has been a picky eater lately. What would you recommend?",
				timestamp: "10:05"
			},
			{
				id: "pediatric-3",
				sender: "contact",
				author: "Dr. Chen",
				text: "I'd recommend a pediatric nutrition consultation. I can refer you to our nutritionist, or we can start with some dietary modifications. Let's schedule a follow-up next week to track her progress.",
				timestamp: "10:08"
			}
		],
		quickReplies: [
			"Let's schedule the nutrition consultation.",
			"Can you send me some dietary guidelines?",
			"I'll track her eating habits this week."
		],
		autoReplies: [
			"Great! I've sent a referral to our nutritionist. They'll contact you within 24 hours.",
			"I've emailed you a comprehensive guide on toddler nutrition. Let me know if you have questions.",
			"Perfect. Keep a daily log and we'll review it together at the next appointment."
		]
	},
	{
		id: "vaccination-schedule",
		name: "Nurse Maria Rodriguez",
		title: "Vaccination Schedule - Liam Smith",
		status: "online",
		unread: 0,
		initials: "MR",
		messages: [
			{
				id: "vaccination-1",
				sender: "user",
				author: "You",
				text: "Hi Maria, I need to reschedule Liam's MMR vaccination. He's been feeling unwell with a cold.",
				timestamp: "09:15"
			},
			{
				id: "vaccination-2",
				sender: "contact",
				author: "Maria",
				text: "Of course! I've moved his appointment to next Tuesday at 10 AM. Please let me know if he's still symptomatic then.",
				timestamp: "09:18"
			},
			{
				id: "vaccination-3",
				sender: "user",
				author: "You",
				text: "That's perfect. Are there any pre-vaccination precautions we should take?",
				timestamp: "09:22"
			},
			{
				id: "vaccination-4",
				sender: "contact",
				author: "Maria",
				text: "Yes! Make sure he's well-hydrated and has a light meal before the appointment. Also, bring his immunization card. I'll email you the full preparation guide.",
				timestamp: "09:25"
			}
		],
		quickReplies: [
			"That's very helpful, thank you.",
			"Can you also send the guide for after-vaccination care?",
			"Should I bring any other documents?"
		],
		autoReplies: [
			"You're welcome! I've also attached a post-vaccination care checklist to the email.",
			"Sure! I've sent the complete care guide. It covers everything from fever management to activity restrictions.",
			"Just bring the immunization card and any recent lab results if available."
		]
	},
	{
		id: "growth-concern",
		name: "Dr. Michael Patel",
		title: "Growth Concern - Sophia Garcia",
		status: "offline",
		unread: 1,
		initials: "MP",
		messages: [
			{
				id: "growth-1",
				sender: "contact",
				author: "Dr. Patel",
				text: "I've reviewed Sophia's growth data from the past 6 months. Her height velocity has decreased significantly. I'd like to order some lab tests to check for underlying causes.",
				timestamp: "Yesterday"
			},
			{
				id: "growth-2",
				sender: "user",
				author: "You",
				text: "That's concerning. What tests are you recommending, and when can we get them done?",
				timestamp: "Yesterday"
			}
		],
		quickReplies: [
			"Please send me the list of tests.",
			"Can we do the tests this week?",
			"What should I tell Sophia about the tests?"
		],
		autoReplies: [
			"I've sent the complete test panel to the lab. They'll call you to schedule the blood work.",
			"Yes, I've scheduled the tests for Thursday morning. Please arrive 15 minutes early.",
			"Just let her know we're checking to make sure she stays healthy and grows strong."
		]
	},
	{
		id: "billing-issue",
		name: "Alex from Support",
		title: "Billing Issue #4821",
		status: "online",
		unread: 2,
		initials: "AS",
		messages: [
			{
				id: "billing-1",
				sender: "contact",
				author: "Alex",
				text: "Hi there! I can see you were charged twice for the Pro plan this month. I've already initiated a refund for the duplicate charge.",
				timestamp: "10:02"
			},
			{
				id: "billing-2",
				sender: "user",
				author: "You",
				text: "Thanks for catching that. How long will the refund take to process?",
				timestamp: "10:05"
			},
			{
				id: "billing-3",
				sender: "contact",
				author: "Alex",
				text: "Typically 3-5 business days depending on your bank. You should see a pending credit within 24 hours though. Is there anything else I can help with?",
				timestamp: "10:08"
			}
		],
		quickReplies: [
			"That's perfect, thank you!",
			"Can I get a receipt for the refund?",
			"I also have a question about upgrading."
		],
		autoReplies: [
			"You're welcome! I've also applied a 10% discount on your next billing cycle as an apology for the inconvenience.",
			"Absolutely — I just emailed the refund confirmation to your registered address.",
			"Of course! I'd be happy to walk you through the available plans."
		]
	},
	{
		id: "api-integration",
		name: "Priya from Engineering",
		title: "API Integration Help",
		status: "online",
		unread: 0,
		initials: "PE",
		messages: [
			{
				id: "api-1",
				sender: "user",
				author: "You",
				text: "I'm getting a 429 rate limit error when calling the /api/products endpoint. We're only making about 50 requests per minute.",
				timestamp: "09:15"
			},
			{
				id: "api-2",
				sender: "contact",
				author: "Priya",
				text: "I checked your API key — it's on the Starter tier which has a 30 req/min limit. You'll need the Growth plan for 200 req/min. Would you like me to upgrade it?",
				timestamp: "09:18"
			},
			{
				id: "api-3",
				sender: "user",
				author: "You",
				text: "Yes please. Also, is there a way to implement retry logic that respects the Retry-After header?",
				timestamp: "09:22"
			},
			{
				id: "api-4",
				sender: "contact",
				author: "Priya",
				text: "Great question — our SDK handles this automatically if you enable `autoRetry: true` in the config. I'll send you a code snippet.",
				timestamp: "09:25"
			}
		],
		quickReplies: [
			"That would be very helpful.",
			"Can you also share the rate limit docs?",
			"We're also seeing timeouts on the webhook endpoint."
		],
		autoReplies: [
			"Here's the code snippet — just add `autoRetry: true` and `maxRetries: 3` to your client config.",
			"Sure! I've shared the rate limiting guide in your inbox. It covers burst limits too.",
			"Let me check the webhook logs for your account. Can you share the endpoint URL you're using?"
		]
	},
	{
		id: "account-access",
		name: "Jordan from Security",
		title: "Account Access Request",
		status: "offline",
		unread: 1,
		initials: "JS",
		messages: [
			{
				id: "access-1",
				sender: "contact",
				author: "Jordan",
				text: "We noticed a login attempt from an unrecognized device in São Paulo. Was this you? We've temporarily locked the session as a precaution.",
				timestamp: "Yesterday"
			},
			{
				id: "access-2",
				sender: "user",
				author: "You",
				text: "No, that wasn't me. I'm based in New York. Can you revoke that session and enable 2FA on my account?",
				timestamp: "Yesterday"
			}
		],
		quickReplies: [
			"Can I also see a list of all active sessions?",
			"Please reset my password as well.",
			"Has any data been accessed from that session?"
		],
		autoReplies: [
			"I've revoked all sessions except your current one and enabled 2FA. You'll get an email with the setup QR code.",
			"Done — you'll receive a password reset link shortly. Make sure to use a unique password.",
			"No data was accessed — the session was blocked before any API calls were made. Your account is secure."
		]
	}
];
