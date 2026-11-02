# Voice and music

## Contents
1. The voice: the developer's own, or a generated one
2. Lay the voice, step by step
3. Saying "Playgama" right
4. Check every take
5. Music and sound

## 1. The voice

- **The developer's own voice.** It earns the most trust and the most comments.
  - Record each script line on a phone in a quiet room.
  - Trim the silence, and time the edit to the recording.
- **A generated voice.** This copy of the skill, in the Playgama plugin, calls no text-to-speech service. The developer
  makes takes in the service they choose and saves them under the names in section 2, or uses the same skill in
  [Playgama/gamedev-skills](https://github.com/Playgama/gamedev-skills), which calls those services with the developer's
  own key.
- **A free system voice, for a draft.** `scripts/voice.mjs make` reads the lines with the computer's own speech, with no
  account, and nothing leaves the machine. It times the edit before the real voice exists. It isn't for publishing.

Whichever it is:
- **One voice for all the developer's videos.** A second voice can read an AI agent's own words, the lines it really
  wrote. The contrast helps the story.
- **Publishing a generated voice needs a plan that allows commercial use.**

Narration pace is about 2.5 words a second. Shorts can run faster, never rushed.

## 2. Lay the voice, step by step

1. **Write the lines** into `vo/lines.json`. Each line has its id, its time in the video (`at`, in seconds) and its
   words:
   ```json
   {
     "spoken": { "Playgama": "play-GAH-ma" },
     "lines": [
       { "id": "v1", "at": 3.5, "text": "This is Sky Shift: a race high above the sea." },
       { "id": "v5", "at": 28.2, "text": "Sky Shift. Play free on Playgama." }
     ]
   }
   ```
   `voice` is optional: the name of a system voice for the draft.
2. **Get the takes.** A take is any audio file saved as `vo/takes/<id>-<take>.<ext>`, such as `vo/takes/v1-1.m4a` and
   `vo/takes/v1-2.m4a`: the developer's recordings, or takes from a service.
   - To time the edit first: `node scripts/voice.mjs make vo/lines.json` writes the whole set in the free draft voice.
     Run it again, or with `--only v4`, to add takes after the ones already there. It never overwrites one.
3. **Transcribe every generated take** and compare it with the line (section 4).
4. **Pick by ear:** `node scripts/voice.mjs review vo/lines.json` writes `vo/review.html`, every take with a player.
   The developer listens and picks one per line.
5. **Lay the track:**
   `node scripts/voice.mjs lay vo/lines.json --pick v1=2,v4=3 --length 32.3 --music audio/music.wav`.
   - It writes `audio/voice.wav`, the picked takes at their times, and `audio/music-ducked.wav`, the music ducked
     under them.
   - It warns when a take runs into the next line.
   - Put both into the template as `<audio>` elements that start at 0 and run the whole video.

## 3. Saying "Playgama" right

It is "play-GAH-ma", every "a" open as in "father". English voices tend to say "play-GAY-ma".
- **Respell it** in what the voice reads (`spoken` does it for the draft voice). The captions and the on-screen text
  keep "Playgama".
- **With ElevenLabs,** a pronunciation dictionary with an alias rule, Playgama → play-GAH-ma, does the same for every
  line.
- **With Gemini,** the name written in Cyrillic, "Плейгама", came out right for us.
- **A person listens.** A transcript can't tell you which reading came out.

### Send only the words

Anything in the text can come out in the voice: a stage direction, a label, a note to yourself. One model read its
own scene description aloud at the end of a take. Send only the words of the line, and keep a delivery note short and
plain.

## 4. Check every take

Seen in real takes that sounded fine on their own:
- a repeated last sentence;
- an extra sentence nobody wrote;
- the instructions read aloud;
- a swallowed last syllable ("publish" for "publishing").

So:
- **Transcribe every take** with Whisper or any speech-to-text, and compare it with the script word for word. Number
  formats ("14" for "fourteen") are fine; extra or missing words are not.
- **Watch the length.** A take much longer than its word count predicts (over about 1.45x at 2.5 words a second)
  usually repeated something.
- **Have a person listen** to every take on the review page.
- **If a last word gets swallowed,** make the line again: another take, or the same words ending on a full stop.

## 5. Music and sound

- **The game's own music first:** it already sounds like the game. If it has none, use a bed, not a song:
  instrumental, steady, no big drops, matched to the game's mood. For a cosy-spooky game, that might be a slightly
  eerie music box over a soft lo-fi beat.
- **Land the music's lift on the first gameplay frame.**
  - Find where the track lifts:
    `ffmpeg -i music.mp3 -af "asetnsamples=n=48000,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null -`
    prints its level each second.
  - Start the track so that the lift lands as the sting hands over to the game, at 3.0 s.
- **Levels:**
  - Voice at about −18 LUFS, the music bed at about −26 LUFS.
  - Duck the bed another ~7 dB while someone speaks. `voice.mjs lay --music` does it before the music goes in,
    because each HyperFrames `<audio>` plays at one fixed volume.
  - Game sounds at their moments, peaking around −12 to −16 dBFS.
- **The finished mix** sits around −14 to −16 LUFS integrated, true peak −1 dBTP or lower:
  `ffmpeg -i video.mp4 -af loudnorm=print_format=summary -f null -`
  - If it comes out quiet, raise the sound without rendering again:
    `ffmpeg -i video.mp4 -c:v copy -af "volume=2.5dB" -c:a aac -b:a 192k louder.mp4`.
- **Licences:**
  - Generated music (ElevenLabs' music generator, Suno and similar): check that your plan allows commercial use of
    music before publishing.
  - Sound effects: CC0 is safest. Credit CC-BY sounds and icons in the description.
