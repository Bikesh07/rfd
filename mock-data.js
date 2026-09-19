const MOCK_DATA = {
  exams: [
    {id:1,code:"CS-SEP-26",name:"Computer Science Fundamentals",date:"19 Sep 2026",status:"ACTIVE",students:500,submitted:428,total:100,avg:74.6},
    {id:2,code:"JAVA-SEP-26",name:"Java Programming",date:"17 Sep 2026",status:"ACTIVE",students:360,submitted:312,total:100,avg:71.2},
    {id:3,code:"PY-SEP-26",name:"Python Programming",date:"12 Sep 2026",status:"COMPLETED",students:540,submitted:506,total:100,avg:78.1},
    {id:4,code:"DB-SEP-26",name:"Database Management",date:"08 Sep 2026",status:"COMPLETED",students:320,submitted:287,total:100,avg:69.8}
  ],
  students: [
    {name:"Rahul Kumar",roll:"101",email:"rahul@gmail.com",className:"B.Tech CSE",attempts:2},
    {name:"Priya Sharma",roll:"102",email:"priya@gmail.com",className:"B.Tech CSE",attempts:3},
    {name:"Amit Singh",roll:"103",email:"amit@gmail.com",className:"B.Tech CSE",attempts:2},
    {name:"Neha Verma",roll:"104",email:"neha@gmail.com",className:"B.Tech IT",attempts:1},
    {name:"Vikas Patel",roll:"105",email:"vikas@gmail.com",className:"BCA",attempts:2}
  ],
  results: [
    {id:"R001",student:"Rahul Kumar",roll:"101",email:"rahul@gmail.com",exam:"Computer Science Fundamentals",examId:1,score:92,total:100,status:"PASS",submitted:"19 Sep 2026, 10:32 AM"},
    {id:"R002",student:"Priya Sharma",roll:"102",email:"priya@gmail.com",exam:"Computer Science Fundamentals",examId:1,score:88,total:100,status:"PASS",submitted:"19 Sep 2026, 10:41 AM"},
    {id:"R003",student:"Amit Singh",roll:"103",email:"amit@gmail.com",exam:"Computer Science Fundamentals",examId:1,score:43,total:100,status:"PASS",submitted:"19 Sep 2026, 10:48 AM"},
    {id:"R004",student:"Neha Verma",roll:"104",email:"neha@gmail.com",exam:"Java Programming",examId:2,score:35,total:100,status:"FAIL",submitted:"17 Sep 2026, 11:12 AM"},
    {id:"R005",student:"Vikas Patel",roll:"105",email:"vikas@gmail.com",exam:"Java Programming",examId:2,score:79,total:100,status:"PASS",submitted:"17 Sep 2026, 11:25 AM"},
    {id:"R006",student:"Rahul Kumar",roll:"101",email:"rahul@gmail.com",exam:"Python Programming",examId:3,score:84,total:100,status:"PASS",submitted:"12 Sep 2026, 09:30 AM"},
    {id:"R007",student:"Priya Sharma",roll:"102",email:"priya@gmail.com",exam:"Python Programming",examId:3,score:91,total:100,status:"PASS",submitted:"12 Sep 2026, 09:42 AM"},
    {id:"R008",student:"Amit Singh",roll:"103",email:"amit@gmail.com",exam:"Database Management",examId:4,score:38,total:100,status:"FAIL",submitted:"08 Sep 2026, 12:03 PM"}
  ],
  questions: [
    {q:"Q1",correct:94},{q:"Q2",correct:86},{q:"Q3",correct:57},{q:"Q4",correct:89},{q:"Q5",correct:35},{q:"Q6",correct:78},{q:"Q7",correct:68},{q:"Q8",correct:81}
  ]
};