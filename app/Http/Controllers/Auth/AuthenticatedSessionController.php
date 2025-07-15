<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use function Termwind\render;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/AuthPage', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */

    public function store(LoginRequest $request): RedirectResponse
    {
    // Validasi input  
    $request->validate([     
        'email' => 'required|email',
        'password' => 'required|min:8', 
    ]);    
    $remember = $request->boolean('remember');
    // Coba autentikasi
    if (!Auth::attempt($request->only('email', 'password'), $remember)) {
        return back()->withErrors(['email' => 'Email atau password salah.']);
    }
    // Regenerasi session setelah login sukses
    $request->session()->regenerate();
    // Dapatkan role pengguna
    $user = Auth::user();

    if ($user->role === 'patient') {
            // Cek apakah pasien sudah memiliki profil
            $patientProfile = $user->patient;

            // Jika profil ada, arahkan ke dashboard pasien
            if ($patientProfile) {
                return redirect()->route('patient.dashboard');
            } else {
                // Jika tidak ada profil, arahkan ke form untuk membuat profil
                return redirect()->route('patient.form');
            }
        }

    // Redirect berdasarkan role   
    return match ($user->role) {
        // 'patient' => redirect()->route('patient.dashboard'),
        // 'patient' => redirect()->route('patient.dashboard'),
        'doctor' => redirect()->route('doctor.dashboard'),
        'employee' => redirect()->route('employee.dashboard'),
        // default => redirect()->route('dashboard'),
    };
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
