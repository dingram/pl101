# MUS syntax reference

## Notes

Notes can be specified in two ways: by absolute duration, or by relative duration. An absolute duration note is `pitch/dur`, where pitch may include sharps/flats (`#`/`b`) and `dur` is in milliseconds. I decided that a millisecond duration wasn't very helpful for actually writing music, so I introduced the idea of tempo and relative duration.

A tempo of 60bpm (the default) can be specified by `\tempo 60`. For more direct translation from a musical score, it can also be specified with a base note, such as `\tempo 8 = 120` for 120 quavers per minute (often notated as ♪ = 120). It is perhaps worth remembering that `\tempo 1 = 33` means a tempo of 33 measures per minute. **NOTE:** The tempo is allowed to change during the song.

Relative duration notes are specified as `pitch:len`, where len is a power of 2, from 1-128. This relative duration can be optionally followed by 1-3 dots, to represent dotted notes.

<table>
<thead>
<tr><th>Length</th><th>Note type</th></tr>
</thead>
<tbody>
<tr><td>1</td><td>Semi-breve</td></tr>
<tr><td>2</td><td>Minim</td></tr>
<tr><td>4</td><td>Crotchet</td></tr>
<tr><td>8</td><td>Quaver</td></tr>
<tr><td>16</td><td>Semiquaver</td></tr>
<tr><td>…</td><td>[etc]</td></tr>
</tbody>
</table>

Rests are specified like notes, but with a pitch of "r".

To make writing music even more compact, the octave and/or duration can be omitted, in which case the value from the previous note will be used. Note that at least one octave or duration value must be given first :-)

## Sequences and parallel notes

A simple sequence is just a series of notes, separated by spaces. Notes played in parallel can be described in two ways.

Firstly, a generic set of parallel notes (all played simultaneously) is enclosed between two angle brackets:

    << c4:4 g4:8 >>

This isn't hugely useful, but there is also syntax to allow parallel sequences. Within a parallel block, simply wrap a series of notes in braces to play them in sequence. In order to play a chord where the bottom note is C and the top note changes from G to F# over two half-beats:

    << c4:4 { g4:8 f#4:8 } >>

(I wish I could easily generate images for this!)

Another example:

    << {c4:4 d4:4 e4:4} {e4:4 f#4:4 g#4:4} {g4:4 a4:4 b4:4) >>

If the notes are all equal in length (e.g. a chord) then there is a shorter way. A minm-length C major chord could be specified like this, using one angle bracket and putting the note duration at the end:

    < c4 e4 g4 >:2

Note that both absolute and relative lengths are supported here, or the length can be omitted just like a regular note.

## Repeats


Finally, repeats can be specified using syntax that looks like the original musical notation:

    |: c4 d e f :|

This will play the enclosed section twice. In order to specify the number of times it should be repeated, enclose it in round brackets afterwards. For example, to play the section four times:

    |: c4:8 d e f :| (4)

## Comments

There are three comment styles: two block, and one line-wise:

    % Lines starting with a % (percent symbol) are comments until end-of-line (like in Lilypond)
    /*******
     * block comments can be done in a c-like style
     */
    %{
      or also using the Lilypond style
    %}

## Advanced commands

There are a few advanced commands which are supported, although not necessarily completely.

 - `\triplet{note note note}` will play three notes in the time usually reserved for two (by simply multiplying their duration by 2/3)
 - `\swung{note note}` will swing two notes that are usually the same length, by dotting the first and halving the second
 - `\time n/d` will set the time signature to `n`/`d` (not currently supported for MIDI)
 - `\key c` will set the key signature to C major (not currently supported for MIDI)
 - `\key f#m` will set the key signature to F# minor (not currently supported for MIDI)
 - `\clef treble` will insert a (notional) treble clef. Also supported: bass, alto, tenor. (not currently supported for MIDI)
 - `\voice 2` will switch to voice two (not currently supported for MIDI)

## Examples

### Twinkle Twinkle Little Star

    c4:4 c g g a a g:2
    f:4 f e e d d c:2
    |: g:4 g f f e e d:2 :|
    c:4 c g g a a g:2
    f:4 f e e d d c:2


### Jingle Bells

(all four voices, but just the first part of the chorus -- without omitting octaves and lengths)

    <<
    /* Treble */
    { |: b4:8 b b:4 :|                                 % Jingle bells, jingle bells
    b:8 d5 g4. a:16 b:4 r                              % Jingle all the way
    c5:8 c5:8 c5:8. c5:16 c5:8 b4:8 b4:8 b4:16 b4:16   % Oh what fun it is to ride on a
    b4:8 a4:8 a4:8 g4:8 a4:4 r:4 }                     % One-horse open sleigh...
    
    { |: g4:8 g4:8 g4:4 :|
    g4:8 g5:8 d4:8. d4:16 g4:4 r:4
    e4:8 e4:8 e4:8. e4:16 e4:8 d4:8 d4:8 g4:16 g4:16
    g4:8 g4:8 g4:8 g4:8 f#4:4 r:4 }
    
    /* Bass */
    { |: d4:8 d4:8 d4:4 :|
    d4:8 b3:8 b3:8. c4:16 d4:4 r:4
    g3:8 g3:8 g3:8. g3:16 g3:8 g3:8 g3:8 d4:16 d4:16
    c#4:8 c#4:8 c#4:8 c#4:8 d4:4 r:4 }
    
    { |: g3:8 g3:8 g3:4 :|
    g3:8 g3:8 g3:8. g3:16 g3:4 r:4
    c3:8 c3:8 c3:8. c3:16 g2:8 g2:8 g2:8 g3:16 g3:16
    e3:8 e3:8 a3:8 a3:8 d3:4 r:4 }
    >>

### Jingle Bells

(same as before, but with lengths and octaves omitted where possible)

    <<
    /* Treble */
    { |: b4:8 b b:4 :|                 % Jingle bells, jingle bells
    b:8 d5 g4:8. a:16 b:4 r            % Jingle all the way
    c5:8 c c:8. c:16 c:8 b4 b b:16 b   % Oh what fun it is to ride on a
    b:8 a a g a:4 r }                  % One-horse open sleigh...
    
    { |: g4:8 g g:4 :|
    g:8 g5 d4:8. d4:16 g:4 r
    e4:8 e e:8. e:16 e:8 d d g:16 g
    g:8 g g g f#:4 r }
    
    /* Bass */
    { |: d4:8 d d:4 :|
    d:8 b3 b:8. c4:16 d:4 r
    g3:8 g g:8. g:16 g:8 g g d4:16 d
    c#:8 c# c# c# d:4 r }
    
    { |: g3:8 g g:4 :|
    g:8 g g:8. g:16 g:4 r
    c:8 c c:8. c:16 g2:8 g g g3:16 g
    e:8 e a:8 a:8 d:4 r }
    >>

### Trumpet Hornpipe (a.k.a. Captain Pugwash)

    |: d4:4 \triplet{g:8 g g} g:4 \triplet{g:8 g g} g:4 \swung{b:8 g} \swung{b d5} \swung{g d} \swung{b4 g}
    \triplet{d4:8 d d} d:4 \triplet{d:8 d d} d:4 \swung{f#:8 d} \swung{f# a} \swung{c5 a4} \swung{f# a}
    \triplet{g4:8 g g} g:4 \triplet{g:8 g g} g:4 \swung{b:8 g} \swung{b d5} g:4 g
    \swung{f# a} \swung{g f#} \swung{e g} \swung{f# e} d:4 d d :|

If you want to see the MUS that these translate to, then check out the tests. It's pretty painful :-)

## Going the other way

There is also a stringifier in mus-util.js (complete with tests!) that converts a MUS structure into a string using the grammar described above. Given the right options, it does a fair job of minifying the output. Having said that, it currently doesn't handle dotted relative durations, tempo changes, or the compressed parallel note syntax for chords.

## MIDI output

It is also possible to convert MUS format files into MIDI. See `mus2midi.js` for the gory details. To run it, call:

   node mus2midi.js input.mus output.midi

This requires the `jsmidgen` module from `npm`.

## Future plans

 - `'` and `,` operators for relative pitches
 - Support for named groups that can be re-used? Perhaps something like `&<name>{...}` to define, and `*<name>` to insert.
 - Improve the stringifier to remove as many of its limitations as possible
 - (If I have lots of time to kill) A way to transform MUS to visual notation, to make it much easier to visualise
