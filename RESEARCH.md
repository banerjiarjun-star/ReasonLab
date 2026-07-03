The Curiosity Graph: Explain how users navigate between related concepts after answering a question.

Metacognitive Capture: Document that we use a 1-5 Likert scale to measure "Confidence" immeidately following a response.

Cognitive Effort(Latency): Define "Response Time" as the duration from question mount to submission, used as a proxy for cognitive load.

The Winning Score(Accuracy): This is just a percentage of showing how many answers they got right.

The "Truth-O-Meter"(Calibration): This shows if people actually know when they are right. If someone says "I'm 100% sure" but gets it wrong, their meter if off.

Thinking Time: This is the average number of seconds they spent before clicking a button.

The Data Path: Explain that when a person answers, the information goes from their screen into a big "storage room"(a database table)

The Magic Cleaning Brain: Explain that we built a "Super-Brain"(called a Postgres View) that takes all of those messy answers and automotically turns them into nice, clean averages.

The Picture Maker: Finally, say that we use a tool called Recharts to turn those numbers into the pretty purple and red bars on your dashboard.