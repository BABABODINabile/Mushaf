<!DOCTYPE html>
<html lang="{{ $subscription->language }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mushaf — Votre {{ $contentType === 'verset' ? 'verset' : 'hadith' }} du jour</title>
</head>
<body style="margin:0;padding:0;background-color:#F5EFDF;font-family:'Georgia','Times New Roman',serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EFDF;">
        <tr>
            <td align="center" style="padding:40px 20px;">

                {{-- Container --}}
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FBF8EF;border-radius:14px;overflow:hidden;border:1px solid #D8CBA0;">

                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#2C534F;padding:28px 32px;text-align:center;">
                            <div style="color:#F5EFDF;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                                — Rappel quotidien —
                            </div>
                            <div style="font-size:28px;color:#F5EFDF;font-weight:bold;font-family:Georgia,serif;">
                                Mushaf
                            </div>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:36px 32px;">

                            {{-- Greeting --}}
                            <div style="font-size:15px;color:#4B5A56;margin-bottom:24px;line-height:1.6;">
                                Assalamu alaykum,
                            </div>

                            @if($contentType === 'verset')
                                {{-- Verse of the day --}}
                                <div style="text-align:center;margin-bottom:28px;">
                                    <div style="font-size:11px;color:#8A8874;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">
                                        — Verset du jour —
                                    </div>

                                    {{-- Arabic text --}}
                                    <div style="font-size:24px;color:#1E2A28;line-height:2.2;direction:rtl;text-align:center;margin-bottom:20px;font-family:'Amiri','Georgia',serif;">
                                        {{ $content['text_ar'] }}
                                    </div>

                                    {{-- Translation --}}
                                    @if(!empty($content['translation']))
                                        <div style="font-size:15px;color:#4B5A56;line-height:1.7;font-style:italic;margin-bottom:16px;">
                                            « {{ $content['translation'] }} »
                                        </div>
                                    @endif

                                    {{-- Reference --}}
                                    <div style="font-size:13px;color:#8A8874;">
                                        {{ $content['ref'] }}
                                    </div>
                                </div>
                            @else
                                {{-- Hadith of the day --}}
                                <div style="text-align:center;margin-bottom:28px;">
                                    <div style="font-size:11px;color:#8A8874;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">
                                        — Hadith du jour —
                                    </div>
                                    @if(!empty($content['title']))
                                        <div style="font-size:14px;color:#A9792C;font-weight:bold;margin-bottom:12px;">
                                            {{ $content['title'] }}
                                        </div>
                                    @endif

                                    {{-- Arabic text --}}
                                    <div style="font-size:20px;color:#1E2A28;line-height:2;direction:rtl;text-align:center;margin-bottom:16px;font-family:'Amiri','Georgia',serif;">
                                        {{ $content['text_ar'] }}
                                    </div>

                                    {{-- Translation --}}
                                    @if(!empty($content['translation']))
                                        <div style="font-size:15px;color:#4B5A56;line-height:1.7;font-style:italic;margin-bottom:16px;">
                                            « {{ $content['translation'] }} »
                                        </div>
                                    @endif

                                    {{-- Reference --}}
                                    <div style="font-size:13px;color:#8A8874;">
                                        {{ $content['ref'] }}
                                    </div>

                                    @if(!empty($content['narrator']))
                                        <div style="font-size:12px;color:#8A8874;margin-top:6px;">
                                            {{ $content['narrator'] }}
                                        </div>
                                    @endif
                                </div>
                            @endif

                            {{-- Divider --}}
                            <div style="height:1px;background:linear-gradient(90deg,transparent,#D8CBA0 15%,#D8CBA0 85%,transparent);margin:24px 0;"></div>

                            {{-- CTA --}}
                            <div style="text-align:center;margin-bottom:16px;">
                                <a href="{{ url('/coran') }}" style="display:inline-block;background-color:#2C534F;color:#F5EFDF;padding:12px 28px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:0.5px;">
                                    Ouvrir le Coran
                                </a>
                            </div>

                            {{-- Closing --}}
                            <div style="font-size:14px;color:#4B5A56;text-align:center;line-height:1.6;">
                                Que ce mot vous accompagne dans votre journée.
                            </div>

                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#EFE6CC;padding:20px 32px;text-align:center;">
                            <div style="font-size:12px;color:#8A8874;line-height:1.6;">
                                <div>
                                    Mushaf — Lecture et écoute du Coran.
                                </div>
                                <div style="margin-top:8px;">
                                    <a href="{{ url('/rappels/unsubscribe/' . $subscription->token) }}" style="color:#A9792C;text-decoration:underline;">
                                        Se désabonner
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>
</body>
</html>
