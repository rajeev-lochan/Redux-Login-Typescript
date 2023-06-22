import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

interface EmployeeData {
    name: string;
    designation: string;
    gender: string;
    position: string[];
    joiningDate: string;
}

const Dashboard: React.FC = () => {

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    const [formData, setFormData] = useState<EmployeeData>({
        name: '',
        designation: '',
        gender: '',
        position: [],
        joiningDate: '',
    });
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [employees, setEmployees] = useState<EmployeeData[]>(() => {
        const storedEmployees = localStorage.getItem('employees');
        return storedEmployees ? JSON.parse(storedEmployees) : [];
    });
    const updateEmployees = (updatedEmployees: EmployeeData[]) => {
        setEmployees(updatedEmployees);
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    };
    const [genderError, setGenderError] = useState('');
    const [positionError, setPositionError] = useState('');
    const [formErrors, setFormErrors] = useState<EmployeeData>({
        name: '',
        designation: '',
        gender: '',
        position: [],
        joiningDate: '',
    });
    const [editEmployeeIndex, setEditEmployeeIndex] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [deleteEmployeeIndex, setDeleteEmployeeIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };


    /**
     * This is to Navigate the Dashboard page to Login page on clicking Logout button
     */
    const location = useLocation();
    const username = location.state?.username;
    const display = username?.split("@")[0].toUpperCase();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    /**
     * Delete button functionality
     */
    const handleDeleteEmployee = (index: number) => {
        setDeleteEmployeeIndex(index);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteEmployee = () => {
        if (deleteEmployeeIndex !== null) {
            const updatedEmployees = [...employees];
            updatedEmployees.splice(deleteEmployeeIndex, 1);
            updateEmployees(updatedEmployees);
            setEmployees(updatedEmployees);
            setDeleteEmployeeIndex(null);
            setDeleteConfirmOpen(false);

            // Show snackbar notification after delete is completed
            setSnackbarOpen(true);
            setSnackbarMessage('Employee deleted successfully');
        }
    };

    const cancelDeleteEmployee = () => {
        setDeleteEmployeeIndex(null);
        setDeleteConfirmOpen(false);
    };

    /**
     * Edit button functionality
     */
    const handleEditEmployee = (index: number) => {
        const employeeToEdit = employees[index];
        setEditEmployeeIndex(index);
        // setFormData({
        //     ...employeeToEdit,
        //     gender: employeeToEdit.gender,
        //     position: [...employeeToEdit.position],
        // });
        setFormData(employeeToEdit);
        setModalOpen(true);
        setIsEditing(true);

    };

    /**
     * This function is for input text field
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'joiningDate') {
            setFormData({
                ...formData,
                [name]: value
            });
            if (value === "") {
                setFormErrors({
                    ...formErrors,
                    [name]: "Please enter valid date"
                });
            }
            else {
                setFormErrors({
                    ...formErrors,
                    [name]: ""
                });
            }
        } else if (value.trim() === '') {
            setFormErrors({
                ...formErrors,
                [name]: 'This Field can not be empty'
            });

        }
        else {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }

        // Check if the value entered is empty or contains only alphabets
        //debugger
        const regex = /^[a-zA-Z\s]*$/;
        if (name !== 'joiningDate' && regex.test(value)) {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        else
            if (name !== 'joiningDate') {
                //debugger
                setFormErrors({
                    ...formErrors,
                    [name]: 'Field can only contain alphabets'
                });
            }
    };

    /**
     * This function is for handling checkboxes
     */
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        let updatedPosition = formData.position.slice();
        if (checked) {
            updatedPosition.push(name);
        } else {
            updatedPosition = updatedPosition.filter((pos) => pos !== name);
        }

        // debugger
        if (updatedPosition.length === 0) {
            setPositionError('This Field is required');
        }
        else {
            setPositionError('');
        }
        setFormData({ ...formData, position: updatedPosition });
    };

    /**
     * This function is for handling radio buttons
     */
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setFormData({ ...formData, gender: value });
        setGenderError('');
    };

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /**
     * This function is for while submitting the form
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // debugger
        // Check if any field of the modal is empty
        let hasError = false;
        const updatedFormErrors = { ...formErrors };

        if (formData.name.trim() === '') {
            updatedFormErrors.name = 'Name cannot be empty';
            hasError = true;
        } else {
            updatedFormErrors.name = '';
        }

        if (formData.designation.trim() === '') {
            updatedFormErrors.designation = 'Designation cannot be empty';
            hasError = true;
        } else {
            updatedFormErrors.designation = '';
        }

        if (formData.joiningDate.trim() === '') {
            updatedFormErrors.joiningDate = 'Joining date cannot be empty';
            hasError = true;
        } else {
            updatedFormErrors.joiningDate = '';
        }

        setFormErrors(updatedFormErrors);

        if (!formData.gender) {
            setGenderError('Please select a gender');
            hasError = true;
        } else {
            setGenderError('');
        }

        if (formData.position.length === 0) {
            setPositionError('Please select at least one position');
            hasError = true;
        } else {
            setPositionError('');
        }

        if (hasError) {
            return;
        }

        setIsLoading(true); // Set loading state to true
        setModalOpen(false);

        setTimeout(() => {
            if (editEmployeeIndex !== null) {
                // Editing an existing employee
                const updatedEmployees = [...employees];
                updatedEmployees[editEmployeeIndex] = formData;
                updateEmployees(updatedEmployees);
                setEmployees(updatedEmployees);
                setEditEmployeeIndex(null);

                setSnackbarOpen(true);
                setSnackbarMessage('Employee updated successfully');

            } else {
                // Adding a new employee
                // setEmployees([...employees, formData]);
                const updatedEmployees = [...employees, formData];
                updateEmployees(updatedEmployees);
                setSnackbarOpen(true);
                setSnackbarMessage('Employee data saved successfully');
            }

            // If there are no errors, add the employee to the list
            setFormData({
                name: '',
                designation: '',
                gender: '',
                position: [],
                joiningDate: '',
            });
            setModalOpen(false);
            setIsEditing(false);

            setIsLoading(false); // Set loading state back to false
        }, 1000);

    };

    return (
        <body className='dashboard-body'>
            <div className='dashboard-form'>
                <h1>Welcome {display}!</h1>
                <Stack direction="row" className='dashboard-buttons'>
                    <Button variant="contained" onClick={handleLogout} style={{ background: 'red' }}>Logout</Button>
                    <TextField
                        label="Search"
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            style: {
                                height: '30px',
                                fontSize: '20px',
                                padding: '0',
                                lineHeight: '20px'
                            },
                        }}
                        InputLabelProps={{
                            style: {
                                height: '20px',
                                marginTop: '-13px'
                            },
                        }}
                        style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                    <Button variant="contained" onClick={() => setModalOpen(true)}>Add</Button>
                </Stack>

                {/* Modal Pop Up */}
                <Modal open={modalOpen} onClose={() => setModalOpen(false)} BackdropProps={{ onClick: () => { }, style: { pointerEvents: 'none' } }}>
                    <div style={{ padding: '16px', background: '#fff', minWidth: '500px', margin: '0 auto', top: '50%', position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <h3>Add Users</h3>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={Boolean(formErrors.name)}
                                helperText={formErrors.name}
                                fullWidth
                            />
                            <br /><br />

                            <TextField
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                error={Boolean(formErrors.designation)}
                                helperText={formErrors.designation}
                                fullWidth
                            />
                            <br /><br />

                            {/* <FormControl error={Boolean(genderError)}> */}
                            <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    value={formData.gender}
                                    onChange={handleRadioChange}
                                >
                                    <FormControlLabel
                                        value="female"
                                        control={<Radio />}
                                        label="Female"
                                        checked={formData.gender === "female"}
                                    />
                                    <FormControlLabel
                                        value="male"
                                        control={<Radio />}
                                        label="Male"
                                        checked={formData.gender === "male"}
                                    />
                                </RadioGroup>
                                <FormHelperText><span style={{ color: "red" }}>{genderError}</span></FormHelperText>
                            </FormControl>
                            <br /><br />

                            {/* <FormControl error={Boolean(positionError)}> */}
                            <FormControl >
                                <FormLabel>Position: </FormLabel>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...label}
                                            name="developer"
                                            onChange={handleCheckboxChange}
                                            checked={formData.position.includes("developer")}
                                        />
                                    }
                                    label="Developer"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...label}
                                            name="designer"
                                            onChange={handleCheckboxChange}
                                            checked={formData.position.includes("designer")}
                                        />
                                    }
                                    label="Designer"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...label}
                                            name="intern"
                                            onChange={handleCheckboxChange}
                                            checked={formData.position.includes("intern")}
                                        />
                                    }
                                    label="Intern"
                                />
                                <FormHelperText>
                                    <span className="error-position">{positionError}</span>
                                </FormHelperText>
                            </FormControl>

                            <br /><br />
                            <TextField
                                className='joinDate'
                                name="joiningDate"
                                value={formData.joiningDate}
                                onChange={handleInputChange}
                                error={Boolean(formErrors.joiningDate)}
                                helperText={formErrors.joiningDate}
                                type='date'
                                fullWidth
                            />
                            <br /><br />

                            <Stack direction="row" spacing={2}>

                                {isEditing ? (
                                    <Button type="submit" variant="contained" color="primary">
                                        Update
                                    </Button>
                                ) : (
                                    <Button type="submit" variant="contained" color="primary">
                                        Save
                                    </Button>
                                )}

                                <Button onClick={() => {
                                    setFormData({
                                        name: '',
                                        designation: '',
                                        gender: '',
                                        position: [],
                                        joiningDate: '',
                                    });
                                    setModalOpen(false)
                                }} variant="contained" style={{ background: 'grey' }}>
                                    Close
                                </Button>
                            </Stack>
                        </form>
                    </div>
                </Modal >

                {/* Delete Modal */}
                < Modal
                    open={deleteConfirmOpen}
                    onClose={cancelDeleteEmployee}
                    BackdropProps={{ onClick: () => { }, style: { pointerEvents: 'none' } }}
                >
                    <div style={{ padding: '16px', background: '#fff', minWidth: '300px', margin: '0 auto', top: '50%', position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this employee?</p>
                        <Stack direction="row" spacing={2}>
                            <Button onClick={cancelDeleteEmployee} variant="contained" style={{ background: 'gray' }}>
                                Cancel
                            </Button>
                            <Button onClick={confirmDeleteEmployee} variant="contained" style={{ background: 'red' }}>
                                Delete
                            </Button>
                        </Stack>
                    </div>
                </Modal >

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={2000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }}
                >
                    <Alert elevation={6} variant="filled" onClose={handleSnackbarClose} severity="success">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>

                {/* Table Data */}
                <Table style={{ marginTop: "50px" }}>
                    <TableHead>
                        <TableRow style={{ padding: '100px' }}>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px" }}>Name</TableCell>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px" }}>Designation</TableCell>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px" }}>Gender</TableCell>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px" }}>Position</TableCell>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px" }}>Joining Date</TableCell>
                            <TableCell style={{ backgroundColor: "rgb(95,169,238)", fontWeight: "bolder", fontSize: "20px", paddingLeft: '45px' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    {isLoading ? (
                        <Backdrop open={true}>
                            <CircularProgress color="primary" />
                        </Backdrop>
                    ) : (
                        <>
                            <TableBody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee, index) => (
                                        <TableRow key={index}>
                                            <TableCell style={{ fontSize: "20px" }}>{employee.name}</TableCell>
                                            <TableCell style={{ fontSize: "20px" }}>{employee.designation}</TableCell>
                                            <TableCell style={{ fontSize: "20px" }}>{employee.gender}</TableCell>
                                            <TableCell style={{ fontSize: "20px" }}>{employee.position.join(", ")}</TableCell>
                                            <TableCell style={{ fontSize: "20px" }}>{employee.joiningDate}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={2}>
                                                    <Button variant="contained" onClick={() => handleEditEmployee(index)}>
                                                        <EditIcon />
                                                    </Button>
                                                    <Button variant="contained" onClick={() => handleDeleteEmployee(index)} style={{ background: "red" }}>
                                                        <DeleteIcon />
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                                            <p style={{ fontWeight: 'bold', color: 'red' }}>No data found.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </>
                    )}
                </Table>
                {/* {employees.length === 0 && filteredEmployees.length === 0 &&(
                    <p style={{ fontWeight: 'bold', color: 'red' }}>
                        No data available.
                    </p>
                )} */}

            </div >
        </body>
    );
}
export default Dashboard;