<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'name' => ['required', 'regex:/^[a-zA-Z\s]+$/', 'max:255'],
        'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
        'password' => [
            'required',
            'confirmed',
            Rules\Password::min(8)
                ->mixedCase()
                ->letters()
                ->numbers()
        ],
    ], [
        'name.required' => 'Nama wajib diisi.',
        'name.regex' => 'Nama hanya boleh berisi huruf dan spasi.',
        'email.required' => 'Email wajib diisi.',
        'email.email' => 'Format email tidak valid.',
        'email.unique' => 'Email sudah digunakan, coba email lain.',
        'password.required' => 'Password wajib diisi.',
        'password.confirmed' => 'Konfirmasi password tidak cocok.',
        'password.min' => 'Password minimal 8 karakter.',
        'password.mixedCase' => 'Password harus memiliki huruf besar dan kecil.',
        'password.numbers' => 'Password harus mengandung angka.',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => 'patient',
    ]);

    event(new Registered($user));
    Auth::login($user);

    return redirect()->route(route: 'login');

    
}

}
