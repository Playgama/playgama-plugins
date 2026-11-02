# The draft voice on Windows: one line of text to a WAV file with Windows' own speech (System.Speech). Nothing leaves the
# machine. voice.mjs runs it with the text, the file and the optional voice in PGV_DRAFT_TEXT, PGV_DRAFT_OUT and
# PGV_DRAFT_VOICE; doctor.mjs runs it with -Check, which only loads the speech library.
param([switch]$Check)

Add-Type -AssemblyName System.Speech
if ($Check) { exit 0 }

$synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
if ($env:PGV_DRAFT_VOICE) { $synth.SelectVoice($env:PGV_DRAFT_VOICE) }
$synth.SetOutputToWaveFile($env:PGV_DRAFT_OUT)
$synth.Speak($env:PGV_DRAFT_TEXT)
$synth.Dispose()
