<?php

namespace App\Http\Controllers;

use App\Models\HadithCollection;
use App\Models\Surah;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $surahs = Surah::orderBy('number')->get();
        $collections = HadithCollection::orderBy('sort_order')->get();
        $now = now()->toAtomString();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        $urls = [
            ['loc' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => '/coran', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => '/hadiths', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => '/ecouter', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => '/quiz', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => '/rappels', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => '/search', 'priority' => '0.5', 'changefreq' => 'monthly'],
        ];

        foreach ($surahs as $surah) {
            $urls[] = [
                'loc' => '/coran/'.$surah->slug,
                'priority' => '0.8',
                'changefreq' => 'monthly',
            ];
        }

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>https://mushaf.app{$url['loc']}</loc>\n";
            $xml .= "    <lastmod>{$now}</lastmod>\n";
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
