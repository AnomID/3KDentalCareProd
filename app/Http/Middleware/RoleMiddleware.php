<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Pastikan user sudah login
        if (!Auth::check()) {
            abort(403, 'Anda harus login untuk mengakses halaman ini.');
        }

        // Periksa apakah role cocok
        if (Auth::user()->role !== $role) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        // if ($role === 'patient' && !Auth::user()->patient) {
        //     return redirect()->route('patient.profile');
        // }
        return $next($request);
    }
}
