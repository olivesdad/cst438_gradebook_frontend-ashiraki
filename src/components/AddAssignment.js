import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie';
import Button from '@mui/material/Button';
import {DataGrid} from '@mui/x-data-grid';
import {SERVER_URL} from '../constants.js'

// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 
//

class AddAssignment extends React.Component {
    constructor(props) {
      super(props);
      this.state = {selected: 0, assignments: [], instructorEmail: '', dueDate: '', assignmentName: '', courseId:0};
    };
 
   componentDidMount() {
    this.fetchAssignments();
  }
 
  handleChange = (e) => {
    // const { name, value } = event.target;
    let val = e.target.value 
    
    this.setState({ [e.target.name] : val});
    console.log(JSON.stringify({assignmentName:this.state.assignmentName,  dueDate: this.state.dueDate, courseId: this.state.courseId}));
  }
  handleSubmit=()=> {
    console.log('AddAssignment.handleSubmit')
    const token = Cookies.get('XSRF-TOKEN');

      fetch(`${SERVER_URL}/addassignment/?email=${this.state.instructorEmail}` , 
          {  
            method: 'POST', 
            headers: { 'Content-Type': 'application/json',
                       'X-XSRF-TOKEN': token }, 
            body: JSON.stringify({assignmentName:this.state.assignmentName,  dueDate: this.state.dueDate, courseId: this.state.courseId})
          } )
      .then(res => {
          if (res.ok) {
            toast.success("Assignment Added!", {
            position: toast.POSITION.BOTTOM_LEFT
            });
            this.props.history.push('/');
          } else {
            toast.error("Failed to add assignment!", {
            position: toast.POSITION.BOTTOM_LEFT
            });
            console.error('Put http status =' + res.status);
      }})
        .catch(err => {
          toast.error("Some Error Happened :(", {
            position: toast.POSITION.BOTTOM_LEFT
          });
          console.error(err);
        });
  }


  fetchAssignments = () => {
    console.log("Assignment.fetchAssignments");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/gradebook`, 
      {  
        method: 'GET', 
        headers: { 'X-XSRF-TOKEN': token }
      } )
    .then((response) => response.json()) 
    .then((responseData) => { 
      if (Array.isArray(responseData.assignments)) {
        //  add to each assignment an "id"  This is required by DataGrid  "id" is the row index in the data grid table 
        this.setState({ assignments: responseData.assignments.map((assignment, index) => ( { id: index, ...assignment } )) });
      } else {
        toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
      }        
    })
    .catch(err => console.error(err)); 
  }
  
  
  render() {
     const columns = [
      {
        field: 'assignmentName',
        headerName: 'Assignment',
        width: 400,
        renderCell: (params) => (
          <div>
          {params.value}
          </div>
        )
      },
      { field: 'courseTitle', headerName: 'Course', width: 300 },
      { field: 'dueDate', headerName: 'Due Date', width: 200 }
      ];
      
      const assignmentSelected = this.state.assignments[this.state.selected];
      return (
          <div align="left" >
            <h4>Add Assignment: </h4>
              <div style={{ height: 450, width: '100%', align:"left"   }}>
                <DataGrid rows={this.state.assignments} columns={columns} />
              </div>
              <form>
                <label> Assignment Name:
                <input type="text" name="assignmentName" value={this.state.assignmentName} onChange={this.handleChange}/>
                </label><br></br>
                <label> Instructor Email:
                <input type="text" name="instructorEmail" onChange={this.handleChange}/>
                </label><br></br>
                <label> Course ID:
                <input type="number" name="courseId"  onChange={this.handleChange}/>
                </label><br></br>
                <label> Due Date:
                <input type="text" name="dueDate" onChange={this.handleChange}/>
                </label><br></br>
              </form>       
              <Button id="Submit" variant="outlined" color="primary" style={{margin: 10}} onClick={this.handleSubmit} >
                   Add Assignment
                </Button>         
            <Button component={Link} to={{pathname:'/gradebook',   assignment: assignmentSelected }} 
                    variant="outlined" color="primary" disabled={this.state.assignments.length===0}  style={{margin: 10}}>
              Grade
            </Button>
            <ToastContainer autoClose={1500} /> 
          </div>
      )
  }
}  

export default AddAssignment;