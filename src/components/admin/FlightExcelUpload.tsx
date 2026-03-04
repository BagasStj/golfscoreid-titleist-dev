import { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FlightExcelUploadProps {
  tournamentId: Id<'tournaments'>;
  userId: Id<'users'>;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExcelRow {
  'Flight Name': string;
  'Flight Number': number;
  'Start Time': string;
  'Start Hole': number;
  'Player Name': string;
  'Player Email': string;
  'Player Handicap': number;
}

interface ParsedFlight {
  flightName: string;
  flightNumber: number;
  startTime?: string;
  startHole: number;
  players: {
    name: string;
    email: string;
    handicap: number;
  }[];
}

export default function FlightExcelUpload({
  tournamentId,
  userId,
  onClose,
  onSuccess,
}: FlightExcelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedFlight[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const createFlight = useMutation(api.flights.createFlight);
  const getOrCreatePlayer = useMutation(api.flights.getOrCreatePlayer);
  const addPlayerToFlight = useMutation(api.flights.addPlayerToFlight);

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      {
        'Flight Name': 'Flight A',
        'Flight Number': 1,
        'Start Time': '08:00',
        'Start Hole': 1,
        'Player Name': 'John Doe',
        'Player Email': 'john.doe@example.com',
        'Player Handicap': 12,
      },
      {
        'Flight Name': 'Flight A',
        'Flight Number': 1,
        'Start Time': '08:00',
        'Start Hole': 1,
        'Player Name': 'Jane Smith',
        'Player Email': 'jane.smith@example.com',
        'Player Handicap': 15,
      },
      {
        'Flight Name': 'Flight B',
        'Flight Number': 2,
        'Start Time': '08:10',
        'Start Hole': 1,
        'Player Name': 'Bob Wilson',
        'Player Email': 'bob.wilson@example.com',
        'Player Handicap': 8,
      },
    ];

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Flights');

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Flight Name
      { wch: 15 }, // Flight Number
      { wch: 12 }, // Start Time
      { wch: 12 }, // Start Hole
      { wch: 20 }, // Player Name
      { wch: 30 }, // Player Email
      { wch: 15 }, // Player Handicap
    ];

    // Download
    XLSX.writeFile(wb, 'flight-upload-template.xlsx');
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

        // Validate and parse data
        const validationErrors: string[] = [];
        const flightsMap = new Map<string, ParsedFlight>();

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // +2 because Excel rows start at 1 and we have header

          // Validate required fields
          if (!row['Flight Name']) {
            validationErrors.push(`Row ${rowNum}: Flight Name is required`);
          }
          if (!row['Flight Number']) {
            validationErrors.push(`Row ${rowNum}: Flight Number is required`);
          }
          if (!row['Start Hole']) {
            validationErrors.push(`Row ${rowNum}: Start Hole is required`);
          }
          if (!row['Player Name']) {
            validationErrors.push(`Row ${rowNum}: Player Name is required`);
          }
          if (!row['Player Email']) {
            validationErrors.push(`Row ${rowNum}: Player Email is required`);
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (row['Player Email'] && !emailRegex.test(row['Player Email'])) {
            validationErrors.push(`Row ${rowNum}: Invalid email format`);
          }

          // Validate numbers
          if (row['Start Hole'] && (row['Start Hole'] < 1 || row['Start Hole'] > 18)) {
            validationErrors.push(`Row ${rowNum}: Start Hole must be between 1 and 18`);
          }

          if (validationErrors.length === 0) {
            const flightKey = `${row['Flight Name']}-${row['Flight Number']}`;
            
            if (!flightsMap.has(flightKey)) {
              flightsMap.set(flightKey, {
                flightName: row['Flight Name'],
                flightNumber: row['Flight Number'],
                startTime: row['Start Time'] || undefined,
                startHole: row['Start Hole'],
                players: [],
              });
            }

            const flight = flightsMap.get(flightKey)!;
            flight.players.push({
              name: row['Player Name'],
              email: row['Player Email'],
              handicap: row['Player Handicap'] || 0,
            });
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setUploadStatus('error');
        } else {
          setParsedData(Array.from(flightsMap.values()));
          setErrors([]);
          setUploadStatus('idle');
        }
      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the format.']);
        setUploadStatus('error');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParsedData([]);
      setErrors([]);
      setUploadStatus('idle');
      parseExcelFile(file);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      // Process each flight
      for (const flightData of parsedData) {
        // Create flight
        const flightResult = await createFlight({
          tournamentId,
          flightName: flightData.flightName,
          flightNumber: flightData.flightNumber,
          startTime: flightData.startTime,
          startHole: flightData.startHole,
          userId,
        });

        if (flightResult.success && flightResult.flightId) {
          // Add players to flight
          for (const playerData of flightData.players) {
            // Get or create player
            const playerResult = await getOrCreatePlayer({
              name: playerData.name,
              email: playerData.email,
              handicap: playerData.handicap,
            });

            if (playerResult.success && playerResult.playerId) {
              // Add player to flight
              await addPlayerToFlight({
                flightId: flightResult.flightId,
                playerId: playerResult.playerId,
                startHole: flightData.startHole,
                userId,
              });
            }
          }
        }
      }

      setUploadStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to upload flights']);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#2e2e2e] to-[#1a1a1a] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-red-900/40">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/80 to-red-950/80 p-6 text-white border-b border-red-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Upload Flights from Excel</h2>
                <p className="text-red-100 text-sm mt-1">
                  Import multiple flights and players at once
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Download Template */}
          <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border-2 border-blue-900/40 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-900/40 rounded-lg flex items-center justify-center border border-blue-800/40">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  Download Template First
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  Download the Excel template to see the correct format for uploading flights.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-gradient-to-r from-blue-900/60 to-blue-950/60 hover:from-blue-800/60 hover:to-blue-900/60 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border border-blue-800/40 shadow-lg hover:shadow-blue-900/50"
                >
                  <Download size={18} />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-700/60 rounded-xl p-8 text-center mb-6 bg-gray-900/40 backdrop-blur-sm hover:border-red-900/40 transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-16 h-16 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/60">
              <Upload className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="font-semibold text-white mb-2">
              Upload Excel File
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Click the button below to select your Excel file
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-green-900/60 to-green-950/60 hover:from-green-800/60 hover:to-green-900/60 text-white px-6 py-3 rounded-lg font-semibold transition-all border border-green-800/40 shadow-lg hover:shadow-green-900/50"
            >
              Select Excel File
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border-2 border-red-900/40 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-900/40 rounded-lg flex items-center justify-center border border-red-800/40">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">
                    Validation Errors
                  </h3>
                  <ul className="text-sm text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <div className="bg-gradient-to-br from-green-950/40 to-green-900/20 border-2 border-green-900/40 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-900/40 rounded-lg flex items-center justify-center border border-green-800/40">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Upload Successful!
                  </h3>
                  <p className="text-sm text-green-300">
                    All flights and players have been created successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && errors.length === 0 && (
            <div className="bg-gray-900/60 border-2 border-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-3">
                Preview ({parsedData.length} flight{parsedData.length !== 1 ? 's' : ''})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {parsedData.map((flight, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 border-2 border-gray-800/60 rounded-xl p-3 hover:border-red-900/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">
                        {flight.flightName} (#{flight.flightNumber})
                      </h4>
                      <span className="text-sm text-gray-400 bg-gray-900/60 px-2 py-1 rounded-lg border border-gray-800/60">
                        {flight.players.length} player{flight.players.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {flight.startTime && <span>🕐 {flight.startTime}</span>}
                      <span className="ml-3">⛳ Hole {flight.startHole}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Players: {flight.players.map(p => p.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-red-900/40 bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-6 py-3 text-gray-300 hover:bg-gray-800/60 rounded-lg font-medium transition-colors disabled:opacity-50 border border-gray-700/60"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={parsedData.length === 0 || errors.length > 0 || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-red-900/60 to-red-950/60 text-white rounded-lg font-semibold hover:from-red-800/60 hover:to-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-2 border border-red-800/40"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Flights
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
