<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class OdontogramAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'odontogram_id',
        'type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'description',
        'tooth_number'
    ];

    protected $casts = [
        'file_size' => 'integer'
    ];

    // Relationships
    public function odontogram(): BelongsTo
    {
        return $this->belongsTo(Odontogram::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopePhotos($query)
    {
        return $query->where('type', 'photo');
    }

    public function scopeXrays($query)
    {
        return $query->where('type', 'xray');
    }

    public function scopeDocuments($query)
    {
        return $query->where('type', 'document');
    }

    public function scopeByTooth($query, $toothNumber)
    {
        return $query->where('tooth_number', $toothNumber);
    }

    // Methods
    public function getFullPathAttribute(): string
    {
        return Storage::path($this->file_path);
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }

    public function getFormattedSizeAttribute(): string
    {
        if (!$this->file_size) {
            return 'N/A';
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            'photo' => 'camera',
            'xray' => 'x-ray',
            'document' => 'file-text',
            default => 'file'
        };
    }

    public function getTypeColorAttribute(): string
    {
        return match ($this->type) {
            'photo' => 'success',
            'xray' => 'warning',
            'document' => 'info',
            default => 'secondary'
        };
    }

    public function getTypeDisplayNameAttribute(): string
    {
        return match ($this->type) {
            'photo' => 'Photo',
            'xray' => 'X-Ray',
            'document' => 'Document',
            default => ucfirst($this->type)
        };
    }

    public function isImage(): bool
    {
        if (!$this->mime_type) {
            return false;
        }

        return str_starts_with($this->mime_type, 'image/');
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    public function canPreview(): bool
    {
        return $this->isImage() || $this->isPdf();
    }

    public function delete()
    {
        // Delete the file from storage
        if (Storage::exists($this->file_path)) {
            Storage::delete($this->file_path);
        }

        return parent::delete();
    }

    protected static function boot()
    {
        parent::boot();

        // Create revision when attachment is created/deleted
        static::created(function (OdontogramAttachment $attachment) {
            if (Auth::check()) {
                OdontogramRevision::create([
                    'odontogram_id' => $attachment->odontogram_id,
                    'table_name' => 'odontogram_attachments',
                    'record_id' => $attachment->id,
                    'action' => 'create',
                    'new_values' => $attachment->getAttributes(),
                    'updated_by' => Auth::id()
                ]);
            }
        });

        static::deleted(function (OdontogramAttachment $attachment) {
            if (Auth::check()) {
                OdontogramRevision::create([
                    'odontogram_id' => $attachment->odontogram_id,
                    'table_name' => 'odontogram_attachments',
                    'record_id' => $attachment->id,
                    'action' => 'delete',
                    'old_values' => $attachment->getAttributes(),
                    'updated_by' => Auth::id()
                ]);
            }
        });
    }
}
