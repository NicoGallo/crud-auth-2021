import React, {useState, useEffect} from 'react';
import {db} from '../firebase';
import moment from 'moment';
import 'moment/locale/es';

function App(props) {

  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editionMode, setEditionMode] = useState(false);
  const [id, setId] = useState('');
  const [lastPage, setLastPage] = useState(null);
  const [desactivate, setDesactivate] = useState(false);

  useEffect(() => {

    const getData = async() => {
      try {
        setDesactivate(true);

        const data = await db.collection(props.user.uid).limit(2).orderBy('date').get();
        console.log(data.docs);
        const arrayData = data.docs.map(doc => ({id: doc.id, ...doc.data()}))

        setLastPage(data.docs[data.docs.length - 1]);
        
        console.log(arrayData);
        setTasks(arrayData)

        const query = await db.collection(props.user.uid).limit(2).orderBy('date').startAfter(data.docs[data.docs.length - 1]).get();
        if(query.empty){
          console.log('No hay mas tareas');
          setDesactivate(true);
        }else{
          setDesactivate(false)
        }
        console.log(data.docs);

      } catch (error) {
        console.log(error);
      }

    }
    getData()
  }, [props.user.uid])


  const addTask = async(e) =>{
    e.preventDefault();
    if(!task.trim()){
      console.log('esta vacio');
      return;
    }

    try {
    
      const newTask = {
        name: task,
        date: Date.now()
      }

      const data = await db.collection(props.user.uid).add(newTask);

      setTasks([
        ...tasks,
        {...newTask, id: data.id}
      ])
      setTask('')
    } catch (error) {
      console.log(error);
    }
  
  }



  const deleteTask = async(id) => {
    try {
     
      await db.collection(props.user.uid).doc(id).delete();
      const arrayFiltered = tasks.filter(item => item.id !== id);
      setTasks(arrayFiltered);

    } catch (error) {
      console.log(error);
    }
  }


  const activateEdition = (item) => {
    setEditionMode(true)
    setTask(item.name);
    setId(item.id)
  }

  const editTask = async (e) => {
    e.preventDefault();
    if(!task.trim()){
      console.log('vacio');
      return;
    }
    try {
    
      await db.collection(props.user.uid).doc(id).update({
        name: task
      });
      const arrayEdited = tasks.map(item => (
        item.id === id ? {id: item.id, date: item.date, name: task} : item
      ))
      setTasks(arrayEdited);
      setEditionMode(false)
      setTask('');
      setId('');
    } catch (error) {
      console.log(error);
    }

  }

  const nextPage = async() => {
    try {
      const data = await db.collection(props.user.uid).limit(2).orderBy('date').startAfter(lastPage).get();
      console.log(data.docs);
      const arrayData = data.docs.map(doc => ({id: doc.id, ...doc.data()}))
      setTasks([
        ...tasks,
        ...arrayData
      ])
      setLastPage(data.docs[data.docs.length - 1]);

    } catch (error) {
      
    }
  }

  return (
    <div className="container mb-2">
    <div className="row">
        <div className="col-md-6">
            <h3>Lista de Tareas</h3>
            <ul className="list-group">
            {
                tasks.map(item => (
                <li className="list-group-item" key={item.id}>
                  <span>{item.name} - {moment(item.fecha).format('LLL')}</span>
                  <button 
                      className="btn btn-danger btn-sm float-right"
                      onClick={() => deleteTask(item.id)}
                  >
                      Eliminar
                  </button>
                    <button 
                        className="btn btn-warning btn-sm float-right mr-2"
                        onClick={() => activateEdition(item)}
                    >
                        Editar
                    </button>
                </li>
                ))
            }
            </ul>
            <button className="btn btn-info btn-block mt-2 btn-sm" onClick={()=> nextPage()} disabled={desactivate}>
              Siguiente
            </button>
        </div>
        <div className="col-md-6">
              <h3>
              {
                  editionMode ? 'Editar Tarea' : 'Agregar Tarea'
              }
              </h3>
              <form onSubmit={editionMode ? editTask:  addTask}>
              <input 
                  type="text" 
                  className="form-control mb-2"
                  placeholder='Ingrese Tarea'
                  value={task}
                  onChange={e => setTask(e.target.value)}
              />
              <button 
                  type='submit'
                  className={
                    editionMode ? 'btn btn-warning btn-block btn-sm' : 
                  'btn btn-dark btn-block btn-sm'
                  }
              >
                  {
                  editionMode ? 'Editar' : 'Agregar'
                  }
              </button>
              </form>
          </div>
    </div>
</div>
  );
}

export default App;