
import { GoogleGenAI } from "@google/genai";

const FALLBACK_ROASTS = [
  "You went down faster than my respect for humanity.",
  "Gravity 1, You 0. Try using your eyes next time.",
  "That was less of a flight and more of a vertical failure.",
  "I've seen bricks fly better than that.",
  "Your performance was as stable as a house of cards in a hurricane.",
  "Maybe try a game where the objective is to hit everything?",
  "Error 404: Skill not found.",
  "You're proof that some people just aren't meant for the skies.",
  "Is your screen off, or are you just like this?",
  "That was physically painful to watch.",
  "You play like you're allergic to success.",
  "I'd call that a crash, but it lacked the dignity of an impact."
];

const WIN_FALLBACK_ROASTS = [
  "You won. Now go outside and find a real personality.",
  "30 points? Your parents must be so proud of your wasted potential.",
  "Congratulations on being the king of a digital landfill.",
  "You beat a flappy bird clone. Is this the peak of your life?",
  "Imagine spending this much effort on something so meaningless.",
  "You've mastered clicking a mouse. Truly, a hero of our time.",
  "The reward for winning is knowing you'll never get that time back."
];

const DARK_JOKES = [
  "You are the human equivalent of a participation award.",
  "Your birth certificate is an apology from the condom factory.",
  "I'm not saying I hate you, but I'd unplug your life support to charge my phone.",
  "You’re the reason they put instructions on shampoo bottles.",
  "If I wanted to kill myself, I’d climb your ego and jump to your IQ.",
  "Some people are like clouds. When they disappear, it’s a beautiful day.",
  "You're proof that even mistakes can have a long life.",
  "I would challenge you to a battle of wits, but I see you are unarmed.",
  "Don't be ashamed of who you are. That's your parents' job.",
  "You're the reason the gene pool needs a lifeguard.",
  "You're like a software update. Every time I see you, I think 'not now'.",
  "You're so disappointing, even your shadow tries to distance itself.",
  "If you were any more useless, you’d be a solar-powered flashlight.",
  "You have a great personality... for a landfill.",
  "You are a gray crayon in a world of neon.",
  "If I gave you a penny for your thoughts, I'd get change back.",
  "You're the human equivalent of a pop-up ad.",
  "I'd call you a tool, but even tools serve a purpose.",
  "Your life is a participation trophy for a game nobody wanted to play.",
  "I'd explain it to you, but I don't have any crayons left.",
  "Mirrors can't talk. Lucky for you, they can't laugh either.",
  "I don't know what makes you so stupid, but it really works.",
  "If I had a dollar for every brain cell you have, I’d have one dollar.",
  "You're the type of person who'd fail a blood test.",
  "Your existence is proof that God has a sense of humor.",
  "I hope your day is as pleasant as you are.",
  "You're as welcome as a wet sock in winter.",
  "I'd tell you to go to hell, but I work there and don't want to see you.",
  "I’m busy right now, can I ignore you some other time?",
  "You're the reason the middle finger was invented.",
  "I'd like to help you out. Which way did you come in?"
];

export async function getAICommentary(score: number, deathReason: string): Promise<string> {
  const isWin = deathReason === 'WIN';
  
  const getRandomFallback = () => {
    const list = isWin ? WIN_FALLBACK_ROASTS : FALLBACK_ROASTS;
    return list[Math.floor(Math.random() * list.length)];
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const contents = isWin 
      ? `The player just WON the Flappy Bird game by reaching 30 points. 
         Write a single, very short (max 15 words) roast about how they wasted their life reaching such a meaningless goal. 
         Personality: Extremely dark, edgy, and cynical. 
         Make it sound like winning is actually a loss for their social life.`
      : `The player just died in a Flappy Bird game. 
         Score: ${score}. 
         Cause of death: ${deathReason}. 
         Write a single, very short (max 15 words) roast. 
         Personality: Extremely dark, edgy, and full of double-meanings. 
         Make it sound like an existential crisis or a dark joke about their "performance." 
         Be brutal, savage, and slightly unhinged.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        temperature: 1.0,
      }
    });

    const text = response.text?.trim();
    if (!text) return getRandomFallback();
    return text;

  } catch (error: any) {
    console.warn("Gemini API Error (likely quota or auth):", error?.message || error);
    return getRandomFallback();
  }
}

export function getAIJoke(): string {
  // Return a random joke from the fixed list instantly
  const randomIndex = Math.floor(Math.random() * DARK_JOKES.length);
  return DARK_JOKES[randomIndex];
}
