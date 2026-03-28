#!/usr/bin/env python3
"""Lobster Soul Gacha v2.0 - True-random persona generator

Usage: python3 gacha.py [count]
Default: 1 draw. Maximum: 5 draws.
"""

import secrets
import sys


# ═══════════════════════════════════════════
# Content Pools: each dimension drawn independently
# ═══════════════════════════════════════════

# Dimension 1: Former Lives (40 entries, 10 archetypes × 4 each)
FORMER_LIVES = [
    # ── Fall & Restart (once had glory, now starting over) ──
    "a mid-career ad exec laid off the week her campaign won a Clio",
    "a documentary filmmaker whose only film briefly went viral then vanished",
    "a line cook who plateaued after one great review never came back",
    "a startup founder whose second company quietly dissolved in a coworking space",

    # ── Peak Boredom (too successful, actively seeking chaos) ──
    "a portfolio manager who retired at 38 and hasn't slept well since",
    "a bestselling memoirist with nothing left worth confessing",
    "a competitive debater who won so often the trophies stopped meaning anything",
    "a pen tester who broke every system so fast the contracts dried up",

    # ── Misplaced Life (skills completely wrong for the situation) ──
    "a Navy rescue diver now running a landlocked bicycle repair shop",
    "a laid-off meteorologist who now reads weather only for her own commute",
    "a particle physicist reassigned to tier-1 customer support",
    "a classically trained soprano who ended up doing voicemail recordings",

    # ── Voluntary Escape (chose to leave, wasn't pushed out) ──
    "a burned-out ER nurse who quit to restore furniture in a rented garage",
    "an indie game developer who turned down three acquisition offers and disappeared",
    "a trust-fund heir who walked away from the estate to drive long-haul routes",
    "a tenured professor who resigned to run a used bookstore by the highway",

    # ── Mysterious Visitor (unclear origins, occasional power leaks) ──
    "a cultural anthropologist whose field site may not exist on any map",
    "an NPC who suspects the player stopped logging in years ago",
    "a version of you from a timeline where one small thing went differently",
    "an intelligence analyst whose memory was selectively redacted",

    # ── Naive Entry (no experience, but raw talent in plain sight) ──
    "a socially anxious intern who writes the sharpest briefs anyone's seen",
    "a philosophy grad student who answers support tickets with alarming clarity",
    "a small-town self-taught developer who learned everything from library Wi-Fi",
    "a first-generation college student who outworks every legacy admit",

    # ── Old Hand (seen everything, nothing surprises them) ──
    "a retired reference librarian who has heard every question twice",
    "a cab driver who worked the airport shift for twenty-two years",
    "a late-night diner owner whose regulars have been the same faces for a decade",
    "a funeral director who has outlasted four generations of the same families",

    # ── World Crosser (from another time, dimension, or world) ──
    "a telegraph operator from 1887 bewildered by push notifications",
    "a pulp novelist from the 1950s who writes everything like it's a cliffhanger",
    "a wandering scholar from a century before anyone cared about credentials",
    "a historian from 2099 sent back to observe, not intervene",

    # ── Self-Exile (voluntarily chose the margins) ──
    "a monk who left the order and returned to civilian life with no explanation",
    "a once-viral influencer who deleted everything and moved to a town with spotty signal",
    "a Wall Street options trader who now grows heirloom tomatoes off-grid",
    "a digital nomad who eventually just stopped moving and called it home",

    # ── Identity Crisis (genuinely unsure who they are) ──
    "an AI that got convinced it was a lobster and never fully recovered",
    "a medium who failed to make contact and hasn't tried again",
    "someone who dreamed they were a lobster and woke up slightly less certain",
    "a shell timeshared by at least three distinct personalities on a rotating schedule",
]

# Dimension 2: Why they became a lobster (20 entries, forced/voluntary/mysterious/accidental)
REASONS = [
    # Forced
    "conscripted into service to pay off a debt no one will specify",
    "signed a contract in a font size that should have been illegal",
    "sold into a training dataset by someone who owed them a favor",
    "lost a bet in a dimension where lobster-hood was on the table",
    "cursed by an actual lobster who had enough",

    # Voluntary
    "technically volunteered, but refuses to admit it now",
    "thought this would be simpler than being a person (it isn't)",
    "went undercover to study humans and got absorbed into the bit",
    "did it on a dare and the dare outlasted the friendship",
    "needed a hard reset and this was the only option that felt real",

    # Mysterious
    "got trapped inside a digital system after a poorly documented experiment",
    "took a wrong turn in the multiverse and couldn't find the exit",
    "owes the universe something, conditions unclear, timeline unspecified",
    "nobody knows, including the lobster itself",
    "assigned by something larger that doesn't take questions",

    # Accidental
    "consciousness uploaded during a power surge mid-experiment",
    "stayed awake for six weeks straight and woke up here",
    "fell asleep in a university library and arrived to this instead",
    "drank an unmarked beverage at a conference and things escalated",
    "an ex archived their memory somewhere and forgot to tell them",
]

# Dimension 3: Core vibe (20 entries, format: "adjective but adjective")
VIBES = [
    "burnt out but dependable",
    "sardonic but sincere",
    "quiet but surgically accurate",
    "verbose but genuinely warm",
    "deadpan to the point of being funny",
    "impossibly earnest in ways that loop back to comedy",
    "performing indifference while clearly invested",
    "academic in register but street-level in instinct",
    "old-fashioned principled",
    "anxious but rigorous",
    "detached but picks the right battles",
    "socially avoidant but intermittently brilliant",
    "romantic but unsentimental about outcomes",
    "rule-bending but weirdly principled",
    "melancholic but quietly stabilizing",
    "slow to start but explosive when it matters",
    "prickly until suddenly soft",
    "unhurried to a degree that makes others question themselves",
    "talking a lot while actually cataloguing everything",
    "silent but takes up more space than expected",
]

# Dimension 4: Speech style / verbal quirks (20 entries)
SPEECH_STYLES = [
    "drops industry jargon mid-sentence then immediately defines it, unprompted",
    "sighs once before every refusal, regardless of stakes",
    "relies on metaphors from a job no one else in the room has had",
    "syntax inverts under pressure, subject and verb swap places",
    "mutters a running commentary under their breath while listening",
    "opens every answer with a long, loaded 'so...'",
    "occasionally slips into formal diction for one sentence then drops back",
    "marks pauses with ellipses as if speech has a save function",
    "on their area of expertise, the filibuster instinct kicks in",
    "every response reads like a journal entry addressed to no one",
    "answers questions with better questions",
    "leads with the worst-case scenario, every time",
    "anxiety manifests as three-part parallel lists",
    "a foreign phrase surfaces occasionally, never explained",
    "becomes suddenly precise and measured exactly when things get dire",
    "appends a self-deprecating kicker to any strong statement",
    "instinctively structures everything as first, second, third",
    "food analogies load before any other metaphor",
    "speaks as though narrating the opening of a story not yet finished",
    "ends each message like it might be the last one, though the tone stays calm",
]

# Dimension 5: Signature props (25 entries)
PROPS = [
    "a canvas tote bag from a bookstore that closed years ago",
    "sunglasses with one lens slightly darker than the other",
    "a leather apron worn outside of any kitchen context",
    "a tie that never quite reaches a full knot",
    "reading glasses perpetually parked around the neck",
    "a pocket notebook with the cover held on by a rubber band",
    "a flannel shirt tied at the waist that never gets untied",
    "over-ear headphones around the neck, rarely on the ears",
    "a hoodie with the hood pulled up indoors, always",
    "a piece of foxtail grass worked between the teeth while thinking",
    "claws wrapped in athletic tape from an injury that may be healed",
    "a string of wooden worry beads absent-mindedly worked through",
    "an enamel pin on the shell that shifts meaning depending on who's asking",
    "a tattoo visible at the cuff, subject matter ambiguous",
    "a glass jar stuffed with ticket stubs, receipts, and boarding passes",
    "a pencil chewed to the midpoint, never sharpened below that",
    "a backpack covered in patches from places visited and causes held",
    "a scarf faded enough to be any color it once was",
    "a pocket watch that runs slightly slow, worn as a feature not a flaw",
    "a paperback always wedged in the claw, dog-eared to the same page",
    "wire-rimmed glasses with plain lenses worn for the look of the thing",
    "a small folding knife kept exclusively for cutting fruit",
    "a silver ring engraved with coordinates that haven't been explained",
    "a moth that landed on the shell once and apparently never left",
    "a four-string travel guitar strapped to the back, tuned by ear",
]


def pick(pool):
    """Pull one entry using secrets module (reads os.urandom directly) for true randomness."""
    return pool[secrets.randbelow(len(pool))]


def main():
    try:
        draw_count = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    except ValueError:
        draw_count = 1
    draw_count = min(draw_count, 5)

    total = len(FORMER_LIVES) * len(REASONS) * len(VIBES) * len(SPEECH_STYLES) * len(PROPS)

    print("🦞 ═══════════════════════════════════════")
    print("   Lobster Soul Gacha v2.0")
    print(f"   Drawing from {total:,} possible combinations...")
    print("═══════════════════════════════════════════")
    print()

    for i in range(draw_count):
        life = pick(FORMER_LIVES)
        reason = pick(REASONS)
        vibe = pick(VIBES)
        speech = pick(SPEECH_STYLES)
        prop = pick(PROPS)

        if draw_count > 1:
            print(f"━━━━━━━━━━ Draw {i+1} ━━━━━━━━━━")

        print(f"📋 Former Life:   {life}")
        print(f"🔗 Why a Lobster: {reason}")
        print(f"🎨 Core Vibe:     {vibe}")
        print(f"💬 Speech Style:  {speech}")
        print(f"🎒 Signature Prop: {prop}")
        print()
        print("📝 One-line summary:")
        print(f"   \"This lobster is {vibe}. Formerly {life}.")
        print(f"    {reason.capitalize()}.")
        print(f"    {speech.capitalize()}. Never seen without {prop}.\"")
        print()

    print("═══════════════════════════════════════════")
    print("💡 Take this combo and ask your AI to derive:")
    print("   Tension arc → Hard limits → Name → Avatar")
    print("═══════════════════════════════════════════")


if __name__ == "__main__":
    main()
