<!DOCTYPE html>
<html lang="{{ $subscription->language }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mushaf — Votre {{ $contentType === 'verset' ? 'verset' : 'hadith' }} du jour</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f2e6;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f2e6;">
        <tr>
            <td align="center" style="padding:32px 16px;">

                {{-- Liseré doré inset (équivalent du trait doré de la carte) --}}
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;border:1px solid rgba(182,144,63,0.55);padding:9px;">
                    <tr>
                        <td style="padding:0;">

                            {{-- Carte papier --}}
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f2e6;">

                                {{-- Brand + coins supérieurs --}}
                                <tr>
                                    <td width="96" style="width:96px;padding:0;">
                                        <div style="width:96px;height:96px;background-color:#132039;border-bottom-right-radius:96px;border-right:2px solid #b6903f;border-bottom:2px solid #b6903f;box-sizing:border-box;">
                                            <div style="padding:24px 0 0 16px;color:#b6903f;font-size:12px;line-height:19px;letter-spacing:5px;text-align:left;font-family:'Georgia',serif;">◆ ◆ ◆</div>
                                        </div>
                                    </td>
                                    <td align="center" valign="bottom" style="padding:0 0 12px 0;">
                                        <div style="color:#b6903f;font-size:13px;letter-spacing:6px;line-height:1;font-family:'Georgia',serif;">◆</div>
                                        <div style="color:#b6903f;font-size:27px;font-weight:bold;letter-spacing:2px;line-height:1.15;font-family:'Georgia','Times New Roman',serif;">Mushaf</div>
                                        <div style="color:#b6903f;font-size:13px;letter-spacing:6px;line-height:1;font-family:'Georgia',serif;">◆</div>
                                    </td>
                                    <td width="96" style="width:96px;padding:0;">
                                        <div style="width:96px;height:96px;background-color:#132039;border-bottom-left-radius:96px;border-left:2px solid #b6903f;border-bottom:2px solid #b6903f;box-sizing:border-box;">
                                            <div style="padding:24px 16px 0 0;color:#b6903f;font-size:12px;line-height:19px;letter-spacing:5px;text-align:right;font-family:'Georgia',serif;">◆ ◆ ◆</div>
                                        </div>
                                    </td>
                                </tr>

                                {{-- Contenu --}}
                                <tr>
                                    <td colspan="3" style="padding:26px 40px 30px 40px;">

                                        @if($contentType === 'verset')
                                            <div style="text-align:center;margin-bottom:22px;">
                                                <div style="font-size:11px;color:#b6903f;text-transform:uppercase;letter-spacing:2px;font-family:'Georgia',serif;">
                                                    — Verset du jour —
                                                </div>
                                            </div>

                                            <div style="font-size:24px;color:#17213a;line-height:2;direction:rtl;text-align:center;font-family:'Amiri','Geeza Pro',Georgia,serif;">
                                                {{ $content['text_ar'] }}
                                            </div>
                                        @else
                                            <div style="text-align:center;margin-bottom:22px;">
                                                <div style="font-size:11px;color:#b6903f;text-transform:uppercase;letter-spacing:2px;font-family:'Georgia',serif;">
                                                    — Hadith du jour —
                                                </div>
                                            </div>

                                            @if(!empty($content['title']))
                                                <div style="font-size:14px;color:#b6903f;font-weight:bold;text-align:center;margin-bottom:14px;font-family:'Georgia',serif;">
                                                    {{ $content['title'] }}
                                                </div>
                                            @endif

                                            <div style="font-size:21px;color:#17213a;line-height:2;direction:rtl;text-align:center;font-family:'Amiri','Geeza Pro',Georgia,serif;">
                                                {{ $content['text_ar'] }}
                                            </div>
                                        @endif

                                        {{-- Séparateur dégradé or --}}
                                        <div style="height:2px;width:46%;margin:26px auto;background-color:#b6903f;background-image:linear-gradient(90deg,transparent,#b6903f 20%,#b6903f 80%,transparent);"></div>

                                        {{-- Traduction --}}
                                        @if(!empty($content['translation']))
                                            <div style="font-size:15px;color:#2a2620;line-height:1.7;font-style:italic;text-align:center;font-family:'Georgia','Times New Roman',serif;">
                                                « {{ $content['translation'] }} »
                                            </div>
                                        @endif

                                        {{-- Référence --}}
                                        <div style="font-size:14px;color:#132039;font-weight:bold;text-align:center;margin-top:24px;font-family:'Georgia',serif;">
                                            {{ $content['ref'] }}
                                        </div>

                                        {{-- Narrateur --}}
                                        @if(!empty($content['narrator']))
                                            <div style="font-size:13px;color:#5a5346;font-style:italic;text-align:center;margin-top:8px;font-family:'Georgia',serif;">
                                                {{ $content['narrator'] }}
                                            </div>
                                        @endif

                                    </td>
                                </tr>

                                {{-- Footer MUSHAF.APP + coins inférieurs --}}
                                <tr>
                                    <td width="96" style="width:96px;padding:0;">
                                        <div style="width:96px;height:96px;background-color:#132039;border-top-right-radius:96px;border-top:2px solid #b6903f;border-right:2px solid #b6903f;box-sizing:border-box;">
                                            <div style="padding:16px 0 0 16px;color:#b6903f;font-size:12px;line-height:19px;letter-spacing:5px;text-align:left;font-family:'Georgia',serif;">◆ ◆ ◆</div>
                                        </div>
                                    </td>
                                    <td align="center" valign="middle" style="padding:0;">
                                        <div style="color:#b6903f;font-size:13px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">MUSHAF.APP
                                        </div>
                                    </td>
                                    <td width="96" style="width:96px;padding:0;">
                                        <div style="width:96px;height:96px;background-color:#132039;border-top-left-radius:96px;border-top:2px solid #b6903f;border-left:2px solid #b6903f;box-sizing:border-box;">
                                            <div style="padding:16px 16px 0 0;color:#b6903f;font-size:12px;line-height:19px;letter-spacing:5px;text-align:right;font-family:'Georgia',serif;">◆ ◆ ◆</div>
                                        </div>
                                    </td>
                                </tr>

                            </table>

                            {{-- Désabonnement --}}
                            <div style="text-align:center;padding:14px 0 2px 0;">
                                <a href="{{ url('/rappels/unsubscribe/' . $subscription->token) }}" style="color:#8a7f5e;font-size:11px;text-decoration:underline;font-family:'Georgia',serif;">
                                    Se désabonner
                                </a>
                            </div>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>