// Google Apps Script for the Exam Admin Portal
// Bind this script to the Google Form response spreadsheet:
// Extensions -> Apps Script

const CONFIG = {
  SHEET_NAME: 'Form Responses 1',
  EXAM_NAME: 'Computer Science Online Examination',
  TOTAL_MARKS: 8,
  PASSING_MARKS: 4,
  DURATION_MINUTES: 60
};

function doGet() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + CONFIG.SHEET_NAME);
    const values = sheet.getDataRange().getValues();
    if (!values.length) return json({success:true, exam:examInfo(), statistics:stats([]), results:[]});
    const headers = values[0].map(v => String(v || '').trim());
    const rows = values.slice(1).filter(row => row.some(v => String(v ?? '').trim() !== ''));
    const results = rows.map((row, i) => {
      const score = Number(firstValue(headers,row,'Score')) || 0;
      const total = CONFIG.TOTAL_MARKS;
      return {
        id: 'RES-' + (i + 1),
        student: String(firstValue(headers,row,'Full Name') || ''),
        name: String(firstValue(headers,row,'Full Name') || ''),
        roll: String(firstValue(headers,row,'Roll Number') || ''),
        rollNumber: String(firstValue(headers,row,'Roll Number') || ''),
        email: String(firstValue(headers,row,'Email Address') || ''),
        mobile: String(firstValue(headers,row,'Mobile Number') || ''),
        classDepartment: String(firstValue(headers,row,'Class / Department') || ''),
        score: score, total: total,
        percentage: total ? Number((score / total * 100).toFixed(2)) : 0,
        status: score >= CONFIG.PASSING_MARKS ? 'PASS' : 'FAIL',
        submitted: formatDate(firstValue(headers,row,'Timestamp')),
        questions: questionData(headers,row)
      };
    });
    return json({success:true, exam:examInfo(), statistics:stats(results), results:results});
  } catch (e) {
    return json({success:false, error:String(e.message || e)});
  }
}

function firstValue(headers,row,name){
  const i=headers.indexOf(name);
  return i >= 0 ? row[i] : '';
}

function questionData(headers,row){
  const ignored=['Timestamp','Email Address','Score','Full Name','Roll Number','Mobile Number','Class / Department'];
  return headers.map((h,i)=>({h:String(h||'').trim(),v:row[i]}))
    .filter(x=>x.h && !ignored.includes(x.h) && String(x.v ?? '').trim() !== '')
    .map((x,i)=>({number:i+1,question:x.h,answer:String(x.v)}));
}

function examInfo(){
  return {name:CONFIG.EXAM_NAME,totalMarks:CONFIG.TOTAL_MARKS,passingMarks:CONFIG.PASSING_MARKS,totalQuestions:CONFIG.TOTAL_MARKS,durationMinutes:CONFIG.DURATION_MINUTES};
}

function stats(results){
  const n=results.length; const pass=results.filter(r=>r.status==='PASS').length; const fail=n-pass;
  const avg=n?results.reduce((a,r)=>a+r.score,0)/n:0;
  return {totalStudents:n,submitted:n,passCount:pass,failCount:fail,passRate:n?Number((pass/n*100).toFixed(2)):0,failRate:n?Number((fail/n*100).toFixed(2)):0,averageScore:Number(avg.toFixed(2)),averagePercentage:n?Number(results.reduce((a,r)=>a+r.percentage,0)/n.toFixed(2)):0,totalMarks:CONFIG.TOTAL_MARKS,passingMarks:CONFIG.PASSING_MARKS};
}

function formatDate(v){
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  return String(v || '');
}

function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
