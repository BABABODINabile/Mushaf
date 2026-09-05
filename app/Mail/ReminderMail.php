<?php

namespace App\Mail;

use App\Models\Subscription;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ReminderMail extends Mailable
{
    public function __construct(
        public Subscription $subscription,
        public string $contentType,  // 'verset' | 'hadith'
        public array $content,      // [text_ar, text_fr, text_en, ref, ...]
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->contentType === 'verset'
            ? 'Votre verset du jour — Mushaf'
            : 'Votre hadith du jour — Mushaf';

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reminder',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
