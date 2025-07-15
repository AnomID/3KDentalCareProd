<?php

namespace App\Http\Controllers;

use App\Models\Icd9cmCodes;
use App\Models\Icd10CodesDiagnoses;
use App\Models\Icd10CodesExternalCause;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;

class IcdController extends Controller
{
    // ICD 9CM Methods
    public function icd9cm(Request $request)
    {
        $search = $request->get('search');

        $codes = Icd9cmCodes::when($search, function ($query, $search) {
            return $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        })->paginate(15);

        return Inertia::render('Karyawan/ICD/ICD9CMView', [
            'codes' => $codes,
            'search' => $search
        ]);
    }

    public function importIcd9cm(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            DB::beginTransaction();

            foreach ($rows as $row) {
                if (!empty($row[0]) && !empty($row[1])) {
                    Icd9cmCodes::updateOrCreate(
                        ['code' => $row[0]],
                        [
                            'code' => $row[0],
                            'description' => $row[1],
                            'is_active' => isset($row[2]) ? (bool)$row[2] : true
                        ]
                    );
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'ICD 9CM codes imported successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    // ICD 10 Diagnoses Methods
    public function icd10Diagnoses(Request $request)
    {
        $search = $request->get('search');

        $codes = Icd10CodesDiagnoses::when($search, function ($query, $search) {
            return $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        })->paginate(15);

        return Inertia::render('Karyawan/ICD/ICD10DiagnosesView', [
            'codes' => $codes,
            'search' => $search
        ]);
    }

    public function importIcd10Diagnoses(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            DB::beginTransaction();

            foreach ($rows as $row) {
                if (!empty($row[0]) && !empty($row[1])) {
                    Icd10CodesDiagnoses::updateOrCreate(
                        ['code' => $row[0]],
                        [
                            'code' => $row[0],
                            'description' => $row[1],
                            'is_active' => isset($row[2]) ? (bool)$row[2] : true
                        ]
                    );
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'ICD 10 Diagnoses codes imported successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    // ICD 10 External Cause Methods
    public function icd10ExternalCause(Request $request)
    {
        $search = $request->get('search');

        $codes = Icd10CodesExternalCause::when($search, function ($query, $search) {
            return $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        })->paginate(15);

        return Inertia::render('Karyawan/ICD/ICD10ExternalCauseView', [
            'codes' => $codes,
            'search' => $search
        ]);
    }

    public function importIcd10ExternalCause(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            DB::beginTransaction();

            foreach ($rows as $row) {
                if (!empty($row[0]) && !empty($row[1])) {
                    Icd10CodesExternalCause::updateOrCreate(
                        ['code' => $row[0]],
                        [
                            'code' => $row[0],
                            'description' => $row[1],
                            'is_active' => isset($row[2]) ? (bool)$row[2] : true
                        ]
                    );
                }
            }

            DB::commit();

            return redirect()->back()->with('success', 'ICD 10 External Cause codes imported successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }
}
