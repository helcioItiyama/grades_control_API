import express from 'express';
import { promises } from 'fs';

const router = express.Router();

const readFile = promises.readFile;
const writeFile = promises.writeFile;

async function getData() {
  const response = await readFile('grades.json', 'utf-8')
  const data = JSON.parse(response);
  return data;
}

router.get('/', async (req, res) => {
  try {
    const data = await getData();
    res.send(data);
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});

router.post('/', async (req, res) => {
  try{
    const {student, subject, type, value} = req.body;
  
    let {nextId, grades} = await getData();

    const newGrade =  {
      id: nextId,
      student, 
      subject, 
      type, 
      value, 
      timestamp: new Date()
    }
    grades.push(newGrade);

    const updateData = {nextId: ++nextId, grades};
    
    writeFile('grades.json', JSON.stringify(updateData));

    res.send(updateData);
  } catch(err) {
    res.status(400).send({error: err.message})
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student, subject, type, value } = req.body;

    const data = await getData(); 
    let index = data.grades.findIndex(grade => grade.id === Number(id));
  
    if(!index) {
      res.status(400).send({error: "grade não encontrada"})
    }

    data.grades[index] = {
      id: Number(id),
      student,
      subject,
      type,
      value,
      timestamp: new Date()
    }

    const updatedGrade = {...data };

    writeFile('grades.json', JSON.stringify(updatedGrade));
    res.send(updatedGrade)

  } catch(err) {
    res.status(400).send({error: err.message})
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  
    let data = await getData();
    const excludeGrade = data.grades.filter(grade => grade.id !== Number(id));

    data.grades = excludeGrade;
  
    writeFile('grades.json', JSON.stringify(data));
    res.send(data)
  } catch(err) {
    res.status(400).send({error: err.message})
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { grades } = await getData();
    const findGrade = grades.find(grade => grade.id === Number(id));

    if(!findGrade) {
      res.status(400).send({error: "Grade não encontrada"})
    }

    res.send(findGrade);
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});

router.get('/:student/:subject', async (req, res) => {
  try {
    const { student, subject } = req.params;
    const { grades } = await getData();
   
    const sumBySubject = grades.reduce((total, grade) => {
      if(grade.student === student && grade.subject === subject) {
        total += Number(grade.value);
      }
      return total;
    }, 0);

    res.send({student, subject, total: sumBySubject});
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});

router.get('/average/:subject/:type', async (req, res) => {
  try {
    const { subject, type } = req.params;
    const { grades } = await getData();

    const findGrade = grades.filter(grade => grade.subject === subject && grade.type === type);
   
    const sumValues = findGrade.reduce((total, grade) => {
      return total += Number(grade.value)
    }, 0);

    const average = sumValues/ findGrade.length;

    res.send({sumValues, totalGrade: findGrade.length, average});
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});

router.get('/sort/:subject/:type', async (req, res) => {
  try {
    const { subject, type } = req.params;
    const { grades } = await getData();

    const findGrade = grades.filter(grade => (grade.subject === subject) && (grade.type === type));

    findGrade.sort((a, b) => (Number(b.value) - Number(a.value)));

    const top3 = findGrade.slice(0, 3);

    res.send({top3});
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
});



export default router;