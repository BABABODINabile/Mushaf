<?php

namespace App\Services;

class QuranText
{
    private const BISMILLAH = "\u{0628}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    private const BISMILLAH_VARIANT = "\u{0628}\u{0651}\u{0650}\u{0633}\u{0652}\u{0645}\u{0650}\u{0020}\u{0671}\u{0644}\u{0644}\u{0651}\u{064E}\u{0647}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0652}\u{0645}\u{064E}\u{0670}\u{0646}\u{0650}\u{0020}\u{0671}\u{0644}\u{0631}\u{0651}\u{064E}\u{062D}\u{0650}\u{064A}\u{0645}\u{0650}";

    /**
     * Retire le préfixe « بسم الله الرحمن الرحيم » collé au premier verset d'une sourate.
     * Conservé à l'identique pour Al-Fatiha, où le Bismillah est réellement le verset 1.
     */
    public static function firstAyahLabel(string $text): string
    {
        $plain = trim(preg_replace('/^\x{FEFF}/u', '', $text));

        foreach ([self::BISMILLAH, self::BISMILLAH_VARIANT] as $bismillah) {
            if (str_starts_with($plain, $bismillah)) {
                $remaining = trim(substr($plain, strlen($bismillah)));

                if ($remaining !== '') {
                    return $remaining;
                }
            }
        }

        return $plain;
    }
}
