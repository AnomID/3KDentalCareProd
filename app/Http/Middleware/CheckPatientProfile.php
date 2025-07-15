<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Patient;

class CheckPatientProfile
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->role === 'patient') {
            $patient = Patient::where('user_id', Auth::id())->first();

            // If patient already has a profile, redirect to patient profile
            if ($patient && $request->route()->getName() === 'patient.form') {
                return redirect()->route('patient.profile');
            }

            // if (!$patient && $request->route()->getName() !== 'patient.form') {
            //     return redirect()->route('patient.form');
            // }

            if (!$patient && $request->route()->getName() === 'patient.dashboard') {
                return redirect()->route('patient.profile');
            }
        }

        return $next($request);
    }
}
