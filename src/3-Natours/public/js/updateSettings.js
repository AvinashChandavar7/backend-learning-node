// updateData

// const updateData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: `http://127.0.0.1:8000/api/v1/users/updateMe`,
//       data: { name, email },
//     })

//     if (res.data.status === 'success') {
//       showAlert("success", "Data update successfully");
//       location.reload(true);
//     }
//   } catch (error) {
//     showAlert('error', error.response.data.message || 'Error while updating');
//   }
// }