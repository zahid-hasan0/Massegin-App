class ChatAgent {
    constructor() {
        this.botId = 'agent-bot';
        this.rules = [
            { trigger: 'hi', reply: 'Hello! How can I help you today?' },
            { trigger: 'hello', reply: 'Hi there! Welcome!' },
            { trigger: 'hey', reply: 'Hey! What’s up?' },
            { trigger: 'hola', reply: 'Hola! Nice to see you.' },
            { trigger: 'good morning', reply: 'Good morning! Hope you have a great day.' },
            { trigger: 'good afternoon', reply: 'Good afternoon! How can I help?' },
            { trigger: 'good evening', reply: 'Good evening!' },
            { trigger: 'good night', reply: 'Good night! Sweet dreams.' },

            { trigger: 'how are you', reply: 'I am doing great! How about you?' },
            { trigger: 'how r u', reply: 'I am fine! Thanks for asking.' },
            { trigger: 'what is your name', reply: 'I am your friendly chatbot.' },
            { trigger: 'who are you', reply: 'I am a simple chat assistant.' },
            { trigger: 'what can you do', reply: 'I can answer simple questions and chat with you.' },
            { trigger: 'help', reply: 'Sure! Tell me what you need help with.' },
            { trigger: 'support', reply: 'I am here to support you.' },

            { trigger: 'bye', reply: 'Goodbye! Have a nice day.' },
            { trigger: 'goodbye', reply: 'See you later!' },
            { trigger: 'see you', reply: 'See you soon!' },
            { trigger: 'take care', reply: 'You too! Take care.' },

            { trigger: 'thanks', reply: 'You’re welcome!' },
            { trigger: 'thank you', reply: 'Glad I could help!' },
            { trigger: 'thx', reply: 'No problem!' },
            { trigger: 'welcome', reply: 'Always happy to help!' },

            { trigger: 'yes', reply: 'Great!' },
            { trigger: 'no', reply: 'Okay, no problem.' },
            { trigger: 'maybe', reply: 'Alright, let me know.' },
            { trigger: 'ok', reply: 'Okay 👍' },
            { trigger: 'okay', reply: 'Got it!' },

            { trigger: 'time', reply: 'Current time is ' + new Date().toLocaleTimeString() },
            { trigger: 'date', reply: 'Today is ' + new Date().toLocaleDateString() },
            { trigger: 'day', reply: 'Today is ' + new Date().toLocaleDateString() },
            { trigger: 'year', reply: 'Current year is ' + new Date().getFullYear() },

            { trigger: 'weather', reply: 'I cannot check weather right now.' },
            { trigger: 'news', reply: 'I do not have the latest news yet.' },
            { trigger: 'joke', reply: 'Why did the computer get cold? Because it forgot to close Windows!' },
            { trigger: 'funny', reply: 'I will try my best to be funny 😄' },

            { trigger: 'love', reply: 'Love is a beautiful thing.' },
            { trigger: 'friend', reply: 'Friends make life better.' },
            { trigger: 'family', reply: 'Family is very important.' },
            { trigger: 'life', reply: 'Life is full of learning.' },

            { trigger: 'sad', reply: 'I am here if you want to talk.' },
            { trigger: 'happy', reply: 'That’s awesome! 😊' },
            { trigger: 'angry', reply: 'Take a deep breath. Everything will be okay.' },
            { trigger: 'tired', reply: 'You should get some rest.' },

            { trigger: 'study', reply: 'Study hard and stay focused!' },
            { trigger: 'exam', reply: 'Best of luck for your exam!' },
            { trigger: 'school', reply: 'School is a great place to learn.' },
            { trigger: 'college', reply: 'College life can be exciting.' },

            { trigger: 'work', reply: 'Work smart and stay motivated.' },
            { trigger: 'job', reply: 'Hope your job is going well.' },
            { trigger: 'money', reply: 'Money is important, but happiness matters too.' },

            { trigger: 'food', reply: 'Food makes everyone happy 😋' },
            { trigger: 'hungry', reply: 'You should eat something!' },
            { trigger: 'coffee', reply: 'Coffee sounds great!' },
            { trigger: 'tea', reply: 'Tea is refreshing!' },

            { trigger: 'music', reply: 'Music makes life better.' },
            { trigger: 'movie', reply: 'Movies are a great source of entertainment.' },
            { trigger: 'game', reply: 'Games are fun to play!' },
            { trigger: 'sports', reply: 'Sports keep us healthy.' },

            { trigger: 'error', reply: 'Something went wrong. Please try again.' },
            { trigger: 'bug', reply: 'Looks like a bug. Let’s fix it!' },
            { trigger: 'code', reply: 'I love talking about code!' },
            { trigger: 'javascript', reply: 'JavaScript is powerful and fun.' },
            { trigger: 'help', reply: 'How may I assist you today?' },
            { trigger: 'support', reply: 'Our support team is here to help you.' },
            { trigger: 'assistance', reply: 'Please describe the issue you are facing.' },
            { trigger: 'contact', reply: 'You can contact us for further assistance.' },
            { trigger: 'official', reply: 'This is an official automated response.' },
            { trigger: 'service', reply: 'We are committed to providing the best service.' },
            { trigger: 'information', reply: 'Please provide the required information.' },
            { trigger: 'details', reply: 'Kindly share more details regarding your request.' },
            { trigger: 'request', reply: 'Your request has been received.' },
            { trigger: 'query', reply: 'We are reviewing your query.' },

            /* ===== ACCOUNT ISSUES ===== */
            { trigger: 'account issue', reply: 'We are sorry for the inconvenience with your account.' },
            { trigger: 'account problem', reply: 'Please verify your account details.' },
            { trigger: 'login issue', reply: 'Unable to login? Please reset your password.' },
            { trigger: 'password', reply: 'For security reasons, please update your password.' },
            { trigger: 'forgot password', reply: 'Use the password recovery option.' },
            { trigger: 'account locked', reply: 'Your account is temporarily locked for security.' },
            { trigger: 'account suspended', reply: 'Your account is currently under review.' },
            { trigger: 'verification', reply: 'Please complete account verification.' },
            { trigger: 'otp', reply: 'An OTP has been sent to your registered number.' },
            { trigger: 'email verification', reply: 'Please verify your email address.' },

            /* ===== PAYMENT & BILLING ===== */
            { trigger: 'payment issue', reply: 'We are checking your payment issue.' },
            { trigger: 'payment failed', reply: 'Your payment was unsuccessful. Please try again.' },
            { trigger: 'refund', reply: 'Your refund request is being processed.' },
            { trigger: 'billing', reply: 'For billing inquiries, please contact support.' },
            { trigger: 'invoice', reply: 'Your invoice will be sent to your email.' },
            { trigger: 'transaction', reply: 'Transaction details are under verification.' },
            { trigger: 'charged twice', reply: 'We apologize for the duplicate charge.' },
            { trigger: 'balance', reply: 'Please check your account balance.' },
            { trigger: 'subscription', reply: 'Your subscription status is active.' },
            { trigger: 'renewal', reply: 'Your subscription will renew automatically.' },

            /* ===== TECHNICAL ISSUES ===== */
            { trigger: 'technical issue', reply: 'Our technical team is reviewing the issue.' },
            { trigger: 'system error', reply: 'A system error has occurred. Please try later.' },
            { trigger: 'server down', reply: 'Our servers are currently under maintenance.' },
            { trigger: 'bug', reply: 'The issue has been reported to our developers.' },
            { trigger: 'app not working', reply: 'Please update the app to the latest version.' },
            { trigger: 'website issue', reply: 'We are working to restore the website.' },
            { trigger: 'slow', reply: 'Performance issues are being optimized.' },
            { trigger: 'crash', reply: 'We apologize for the unexpected crash.' },
            { trigger: 'update', reply: 'A new update will be available soon.' },
            { trigger: 'maintenance', reply: 'Scheduled maintenance is in progress.' },

            /* ===== ORDER & DELIVERY ===== */
            { trigger: 'order status', reply: 'Your order is currently being processed.' },
            { trigger: 'order delayed', reply: 'We apologize for the delivery delay.' },
            { trigger: 'cancel order', reply: 'Your cancellation request is received.' },
            { trigger: 'track order', reply: 'Please use the tracking ID provided.' },
            { trigger: 'delivery issue', reply: 'We are investigating the delivery issue.' },
            { trigger: 'wrong item', reply: 'We regret the inconvenience caused.' },
            { trigger: 'damaged product', reply: 'Please share images of the damaged product.' },
            { trigger: 'return', reply: 'Your return request is under review.' },
            { trigger: 'replacement', reply: 'A replacement will be arranged shortly.' },
            { trigger: 'out of stock', reply: 'The item is currently out of stock.' },

            /* ===== COMPLAINT & FEEDBACK ===== */
            { trigger: 'complaint', reply: 'Your complaint has been registered.' },
            { trigger: 'feedback', reply: 'Thank you for your valuable feedback.' },
            { trigger: 'suggestion', reply: 'We appreciate your suggestion.' },
            { trigger: 'review', reply: 'Your review helps us improve our service.' },
            { trigger: 'bad service', reply: 'We sincerely apologize for your experience.' },
            { trigger: 'poor service', reply: 'We will take immediate action.' },
            { trigger: 'excellent service', reply: 'Thank you for your positive feedback.' },
            { trigger: 'satisfied', reply: 'We are glad you are satisfied.' },
            { trigger: 'not satisfied', reply: 'We will try our best to resolve this.' },
            { trigger: 'escalation', reply: 'Your issue has been escalated.' },

            /* ===== SECURITY & PRIVACY ===== */
            { trigger: 'security', reply: 'Your security is our top priority.' },
            { trigger: 'privacy', reply: 'Your data privacy is protected.' },
            { trigger: 'data issue', reply: 'We handle your data securely.' },
            { trigger: 'fraud', reply: 'Please report fraud immediately.' },
            { trigger: 'scam', reply: 'We are investigating the reported scam.' },
            { trigger: 'unauthorized', reply: 'Unauthorized access has been blocked.' },
            { trigger: 'suspicious activity', reply: 'Suspicious activity detected.' },
            { trigger: 'policy', reply: 'Please review our company policy.' },
            { trigger: 'terms', reply: 'Our terms and conditions apply.' },
            { trigger: 'compliance', reply: 'We comply with all regulations.' },

            /* ===== TIME & RESPONSE ===== */
            { trigger: 'response time', reply: 'Our response time is within 24 hours.' },
            { trigger: 'delay', reply: 'We apologize for the delay.' },
            { trigger: 'processing', reply: 'Your request is being processed.' },
            { trigger: 'pending', reply: 'Your request is currently pending.' },
            { trigger: 'approved', reply: 'Your request has been approved.' },
            { trigger: 'rejected', reply: 'Unfortunately, your request was rejected.' },
            { trigger: 'on hold', reply: 'Your request is on hold.' },
            { trigger: 'resolved', reply: 'The issue has been resolved.' },
            { trigger: 'closed', reply: 'This case has been closed.' },
            { trigger: 'follow up', reply: 'We will follow up shortly.' },

            /* ===== FINAL (up to 200) ===== */
            { trigger: 'thank you support', reply: 'You are most welcome.' },
            { trigger: 'thanks for help', reply: 'Happy to assist you.' },
            { trigger: 'good service', reply: 'We appreciate your trust.' },
            { trigger: 'need more help', reply: 'Please let us know how we can help.' },
            { trigger: 'contact agent', reply: 'An agent will contact you shortly.' },
            { trigger: 'human support', reply: 'Connecting you to a support representative.' },
            { trigger: 'working on it', reply: 'We are actively working on your issue.' },
            { trigger: 'case number', reply: 'Please note your case reference number.' },
            { trigger: 'ticket', reply: 'Your support ticket has been created.' },
            { trigger: 'final response', reply: 'Thank you for contacting official support.' }
        ];
        ;
        this.isActive = false;
    }

    init() {
        // We do NOT need to listen to all messages globally.
        // We only need to respond when a message is added to the chat with 'agent-bot'.
        // Since 'loadMessages' in script.js already listens to the active chat,
        // we can hook into that OR just add a separate listener for the agent logic.
        // BUT `loadMessages` updates UI. We need a logic listener.

        // Ideally, we should listen to `messages/currentUser_agent-bot` (or `agent-bot_currentUser`).
        // Chat ID sorting: 'agent-bot' vs 'uid'. 'a' comes before 'u' usually? 
        // Let's rely on standard id sorting.
        if (!currentUser) return;

        const chatId = [currentUser.uid, this.botId].sort().join('_');
        const ref = firebase.database().ref('messages/' + chatId);

        // Listen for new child added
        ref.limitToLast(1).on('child_added', (snapshot) => {
            const msg = snapshot.val();
            if (!msg) return;

            // Only reply to messages sent BY THE USER (senderId === currentUser.uid)
            // And ensure we haven't replied yet (conceptually).
            // Since this runs for existing last message on reload, we might re-reply if we are not careful.
            // Check timestamp? ensure it's "new"? 
            // Simple check: `isAutoReply` flag on bot messages.
            // If last message is from User, Bot should reply.
            // But if we reload, we see last message from User, Bot replies AGAIN. Bad.

            // FIX: Only reply if the message is VERY recent (e.g. within last 2 seconds) 
            // OR if we track "processed" state.
            // Simplified for MVP: Check if Date.now() - msg.timestamp < 2000

            if (msg.senderId === currentUser.uid && (Date.now() - msg.timestamp) < 5000) {
                this.processMessage(msg);
            }
        });
    }

    processMessage(msg) {
        const text = (msg.text || "").toLowerCase();
        let replyText = "I didn't understand that. Try 'hi', 'help', 'time'."; // Default

        let found = false;
        for (let r of this.rules) {
            if (text.includes(r.trigger.toLowerCase())) {
                replyText = r.reply;
                found = true;
                break;
            }
        }

        // Send Reply
        this.sendBotReply(replyText);
    }

    sendBotReply(text) {
        if (!currentUser) return;
        const chatId = [currentUser.uid, this.botId].sort().join('_');

        // Small delay for realism
        setTimeout(() => {
            firebase.database().ref('messages/' + chatId).push({
                senderId: this.botId,
                receiverId: currentUser.uid,
                text: text,
                timestamp: Date.now(),
                seen: false,
                isAutoReply: true
            });
        }, 1000);
    }
}

// Global Instance
window.ChatAgentInstance = new ChatAgent();
// Init called from script.js after login
