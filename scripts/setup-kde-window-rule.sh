#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
#
# Optional one-time setup for KDE Plasma.
#
# Creates a KWin window rule that forces the Blinkly break overlay to stay
# fullscreen, on top of all other windows, and prevents minimization.
#
# The application already blocks Alt+Tab and pointer input on Wayland via
# compositor protocols; this rule is an extra hardening layer for KDE users.

set -euo pipefail

if command -v kwriteconfig6 >/dev/null 2>&1; then
    WRITE=kwriteconfig6
elif command -v kwriteconfig5 >/dev/null 2>&1; then
    WRITE=kwriteconfig5
else
    echo "Error: kwriteconfig5/kwriteconfig6 not found." >&2
    exit 1
fi

RULE_ID="blinkly-break-overlay"
FILE="kwinrulesrc"

echo "Installing KDE window rule for Blinkly..."

$WRITE --file "$FILE" --group "$RULE_ID" --key "description" "Blinkly Break Overlay"
$WRITE --file "$FILE" --group "$RULE_ID" --key "title" "Blinkly Break"
$WRITE --file "$FILE" --group "$RULE_ID" --key "titlematch" "1"
$WRITE --file "$FILE" --group "$RULE_ID" --key "wmclass" "blinkly"
$WRITE --file "$FILE" --group "$RULE_ID" --key "wmclassmatch" "1"
$WRITE --file "$FILE" --group "$RULE_ID" --key "wmclasscomplete" "false"
$WRITE --file "$FILE" --group "$RULE_ID" --key "above" "true"
$WRITE --file "$FILE" --group "$RULE_ID" --key "aboverule" "4"
$WRITE --file "$FILE" --group "$RULE_ID" --key "fullscreen" "true"
$WRITE --file "$FILE" --group "$RULE_ID" --key "fullscreenrule" "4"
$WRITE --file "$FILE" --group "$RULE_ID" --key "minimize" "false"
$WRITE --file "$FILE" --group "$RULE_ID" --key "minimizerule" "4"
$WRITE --file "$FILE" --group "$RULE_ID" --key "noborder" "true"
$WRITE --file "$FILE" --group "$RULE_ID" --key "noborderrule" "4"
$WRITE --file "$FILE" --group "$RULE_ID" --key "types" "1"

echo "Window rule installed. Log out and back in (or restart KWin) for it to take effect."
