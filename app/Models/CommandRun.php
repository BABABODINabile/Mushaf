<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class CommandRun extends Model
{
    protected $fillable = [
        'command_key',
        'status',
        'log_path',
        'exit_code',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'exit_code' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function scopeRunning(Builder $query): Builder
    {
        return $query->where('status', 'running');
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function commandLabel(): string
    {
        return config("commands.{$this->command_key}.label", $this->command_key);
    }
}
