# The God Shot: Engineering the Perfect Espresso

## The Morning Lottery: Sour vs. Bitter

We've all been there. You buy a fresh bag of single-origin beans, excited for that morning nectar. The first day, you get a sour battery acid assault on the palate. The next day, you adjust the grind, and receive a cup of bitter, over-extracted disappointment. Dialing in espresso is notoriously finicky. It can feel like art, or magic, or just dumb luck. But at Sigma-Stream, we don't believe in luck. We believe in data.

Why guess when you can measure? Why stumble when you can optimize?

See the this analysis in [Sigma-Stream](https://sigma-stream.com/output?state=eyJkb2VGYWN0b3JzIjpbeyJpZCI6IjE3Njk1NzQwNzc1MTIiLCJuYW1lIjoiR3JpbmQgU2l6ZSIsImxldmVscyI6WzEyLDE2XX0seyJpZCI6IjE3Njk1NzQxMTU4NjEiLCJuYW1lIjoiRG9zZSIsImxldmVscyI6WzE4LDIwXX0seyJpZCI6IjE3Njk1NzQxMjI1OTQiLCJuYW1lIjoiVGVtcGVyYXR1cmUiLCJsZXZlbHMiOls5Miw5Nl19XSwiZG9lUnVucyI6W3siaWQiOjEsImZhY3RvcnMiOnsiR3JpbmQgU2l6ZSI6MTIsIkRvc2UiOjE4LCJUZW1wZXJhdHVyZSI6OTJ9LCJ5Ijo3fSx7ImlkIjoyLCJmYWN0b3JzIjp7IkdyaW5kIFNpemUiOjEyLCJEb3NlIjoxOCwiVGVtcGVyYXR1cmUiOjk2fSwieSI6M30seyJpZCI6MywiZmFjdG9ycyI6eyJHcmluZCBTaXplIjoxMiwiRG9zZSI6MjAsIlRlbXBlcmF0dXJlIjo5Mn0sInkiOjh9LHsiaWQiOjQsImZhY3RvcnMiOnsiR3JpbmQgU2l6ZSI6MTIsIkRvc2UiOjIwLCJUZW1wZXJhdHVyZSI6OTZ9LCJ5IjoxMH0seyJpZCI6NSwiZmFjdG9ycyI6eyJHcmluZCBTaXplIjoxNiwiRG9zZSI6MTgsIlRlbXBlcmF0dXJlIjo5Mn0sInkiOjZ9LHsiaWQiOjYsImZhY3RvcnMiOnsiR3JpbmQgU2l6ZSI6MTYsIkRvc2UiOjE4LCJUZW1wZXJhdHVyZSI6OTZ9LCJ5IjoyfSx7ImlkIjo3LCJmYWN0b3JzIjp7IkdyaW5kIFNpemUiOjE2LCJEb3NlIjoyMCwiVGVtcGVyYXR1cmUiOjkyfSwieSI6N30seyJpZCI6OCwiZmFjdG9ycyI6eyJHcmluZCBTaXplIjoxNiwiRG9zZSI6MjAsIlRlbXBlcmF0dXJlIjo5Nn0sInkiOjl9XSwieVNwZWNzIjp7InRhcmdldCI6IiIsImxzbCI6IiIsInVzbCI6IiJ9LCJvcHRpbWl6ZXJJbnB1dHMiOnsiR3JpbmQgU2l6ZSI6eyJsb3dlckxpbWl0IjoxMywidXBwZXJMaW1pdCI6MTUsInRhcmdldCI6MTR9LCJEb3NlIjp7Imxvd2VyTGltaXQiOjE3LCJ1cHBlckxpbWl0IjoyMSwidGFyZ2V0IjoxOX0sIlRlbXBlcmF0dXJlIjp7Imxvd2VyTGltaXQiOjg1LCJ1cHBlckxpbWl0IjoxMDMsInRhcmdldCI6OTR9fX0%3D)

## De-Mystifying the Puck

Espresso extraction is physics and chemistry. It involves fluid dynamics, solubility, and pressure. Instead of the typical "dialing in" method (change one thing, taste, guess, change another, forget what you did), we applied **Sigma-Stream's Design of Experiments (DOE)** engine.

We wanted to find the "God Shot", that elusive sweet spot of balanced acidity, sweetness, and body, and we wanted to find it *fast*.

## Step 1: The Variables of Extraction

We identified the three most controllable drivers of extraction yield and flavor perception. We set "High" and "Low" boundaries for each, ensuring they were distinct enough to show effects but safe enough to be drinkable.

1.  **Grind Size:** 
    *   Low (-): Setting 12 (Fine)
    *   High (+): Setting 16 (Coarser)
2.  **Dose:** 
    *   Low (-): 18.0g
    *   High (+): 20.0g
3.  **Temperature:** 
    *   Low (-): 92°C
    *   High (+): 96°C

## Step 2: The 8-Shot Sprint

A full factorial design ($2^3$) gave us 8 unique combinations (plus a few center-point shots to check for linearity). We used the Sigma-Stream randomized run sheet to eliminate bias (like heat-soak effects).

The Response Variable (Y)? **Taste Score** (blind tasted, rated 1-10) and **Total Dissolved Solids (TDS)** via refractometer.

![image1](/blog/assets/espresso1.png)

## Step 3: Cracking the Code

We ran the shots, entered the data into Sigma-Stream, and let the algorithms do the heavy lifting. The insights were counter-intuitive.

### The Heavy Hitter: Grind is King (Obviously)
The Pareto chart confirmed that **Grind Size** had the largest single effect on TDS. No surprise there. Finer grind = more surface area = higher extraction. But looking at *Taste Score*, things got interesting.

### The Hidden Trap: The Dose/Temperature Interaction

Here is where manual dialing fails. Most people assume hotter water always extracts more. Sigma-Stream revealed a critical **Interaction Effect** between Dose and Temperature.

*   At **18g (Low Dose)**, increasing temperature to 96°C drastically *lowered* the taste score, introducing harsh astringency (channeling likely increased).
*   At **20g (High Dose)**, the higher 96°C temperature was *necessary* to penetrate the thicker puck and fully develop the sweetness.

![image2](/blog/assets/espresso2.png)

If we had tuned these variables separately, we would have missed this relationship. We likely would have stuck with a lower temp and a high dose, resulting in a sour, under-extracted cup, or a high temp and low dose, resulting in bitterness.

## The Perfect Formula

Sigma-Stream generated our prediction profile. To maximize Taste Score for this specific bean:

*   **Grind:** 13.5 (Medium-Fine)
*   **Dose:** 19.5g
*   **Temp:** 95.5°C

We pulled the shot based on these calculated values. The result? **Notes of blackberry jam, dark chocolate, and zero bitterness.** A 9.5/10 score on the first validation pull.

## Conclusion

Espresso isn't magic. It's a multivariable equation. With Sigma-Stream, you stop chasing the God Shot and start engineering it.