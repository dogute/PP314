$(async function () {
    await getTableWithUsers();
    getNewUserForm();
    getDefaultModal();
    addNewUser();
})

const userFetchService = {
    head: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': null
    },
    findAuthUser: async () => await fetch('api/users/auth_user'),
    findAllUsers: async () => await fetch('api/users'),
    findOneUser: async (id) => await fetch(`api/users/${id}`),
    addNewUser: async (user) => await fetch('api/users', {method: 'POST', headers: userFetchService.head, body: JSON.stringify(user)}),
    updateUser: async (user, id) => await fetch(`api/users/${id}`, {method: 'PUT', headers: userFetchService.head, body: JSON.stringify(user)}),
    deleteUser: async (id) => await fetch(`api/users/${id}`, {method: 'DELETE', headers: userFetchService.head})
}

async function getTableWithUsers() {
    userFetchService.findAllUsers()
        .then(res => res.json())
        .then(data => renderUsers(data))
}

const renderUsers = (users) => {
    let table = $('#mainTableWithUsers tbody');
    table.empty();

    users.forEach(user => {
        let userRoles = "";
        for(let i = 0; i < user.roles.length; i++) {
            userRoles += user.roles[i].role.replace("ROLE_"," ");
            userRoles += " ";
        }
        let temp = `<tr>
                  <th scope="row">${user.id}</th>
                  <td>${user.firstName}</td>
                  <td>${user.lastName}</td>
                  <td>${user.age}</td>
                  <td>${user.username}</td>
                  <td>${userRoles}</td>     
                  <td><button type="button" class="btn btn-info" data-userid="${user.id}" data-action="edit" data-toggle="modal" data-target="#defaultModal">
                      Edit
                    </button></td>
                <td><button type="button" class="btn btn-danger" data-userid="${user.id}" data-action="delete" data-toggle="modal" data-target="#defaultModal">
                    Delete
                </button></td>
                </tr>`
        table.append(temp)
    })

    $("#mainTableWithUsers").find('button').on('click', (event) => {
        let defaultModal = $('#defaultModal');

        let targetButton = $(event.target);
        let buttonUserId = targetButton.attr('data-userid');
        let buttonAction = targetButton.attr('data-action');

        defaultModal.attr('data-userid', buttonUserId);
        defaultModal.attr('data-action', buttonAction);
        defaultModal.modal('show');
    })
}


async function getDefaultModal() {
    $('#defaultModal').modal({
        keyboard: true,
        backdrop: "static",
        show: false
    }).on("show.bs.modal", (event) => {
        let thisModal = $(event.target);
        let userid = thisModal.attr('data-userid');
        let action = thisModal.attr('data-action');
        switch (action) {
            case 'edit':
                editUser(thisModal, userid);
                break;
            case 'delete':
                deleteUser(thisModal, userid);
                break;
        }
    }).on("hidden.bs.modal", (e) => {
        let thisModal = $(e.target);
        thisModal.find('.modal-title').html('');
        thisModal.find('.modal-body').html('');
        thisModal.find('.modal-footer').html('');
    })
}

async function editUser(modal, id) {
    let preuser = await userFetchService.findOneUser(id);
    let user = preuser.json();

    modal.find('.modal-title').html('Edit user');

    let editButton = `<button  class="btn btn-outline-success" id="editButton">Edit</button>`;
    let closeButton = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
    modal.find('.modal-footer').append(editButton);
    modal.find('.modal-footer').append(closeButton);

    user.then(user => {
        let bodyForm = `
            <form class="form-group" id="editUser">
                <div class="form-group">
                  <label for="id"><b>ID</b></label>
                  <input type="text" class="form-control" id="id" value="${user.id}" readonly/>
                </div>
                <div class="form-group">
                  <label for="firstName1"><b>First Name</b></label>
                  <input type="text" class="form-control" id="firstName1" value="${user.firstName}" name="firstName"/>
                </div>
                <div class="form-group">
                  <label for="lastName1"><b>Last Name</b></label>
                  <input type="text" class="form-control" id="lastName1" value="${user.lastName}" name="lastName"/>
                </div>             
                <div class="form-group">
                  <label class="form-label" for="age1"><b>Age</b></label>
                  <input type="number" id="age1" class="form-control" value="${user.age}" name="age"/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="username1"><b>Email</b></label>
                  <input type="text" id="username1" class="form-control" value="${user.username}" name="username"/>
                </div>
                <div class="form-group">
                  <label for="password1"><b>Password</b></label>
                  <input type="password" class="form-control" id="password1" value="${user.password}" name="password"/>
                </div>
                <div class="form-group">
                  <label for="role1"><b>Role</b></label>
                  <select size="2" multiple class="form-control" id="role1">
                    <option value="ROLE_USER">USER</option>
                    <option value="ROLE_ADMIN">ADMIN</option>
                 </select>
                </div>
                </form>`
        modal.find('.modal-body').append(bodyForm);
    })

    $("#editButton").on('click', async () => {
        let id = modal.find("#id").val().trim();
        let firstName = modal.find("#firstName1").val().trim();
        let lastName = modal.find("#lastName1").val().trim();
        let age = modal.find("#age1").val().trim();
        let username = modal.find("#username1").val().trim();
        let password = modal.find("#password1").val().trim();
        let roles = modal.find("#role1").val();
        let data = {
            id: id,
            firstName: firstName,
            lastName : lastName,
            age: age,
            username : username,
            password: password,
            roles: roles
        }
        console.log(data)
        const response = await userFetchService.updateUser(data, id).catch(error => console.log(error));

        if (response.ok) {
            getTableWithUsers();
            modal.modal('hide');
        } else {
            let body = await response.json();
            let alert = `<div class="alert alert-danger alert-dismissible fade show col-12" role="alert" id="Error">
                            ${body.info}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;
            modal.find('.modal-body').prepend(alert);
        }
    })
}

async function deleteUser(modal, id) {
    let preuser = await userFetchService.findOneUser(id);
    let user = preuser.json();
    modal.find('.modal-title').html('Delete user');

    let deleteButton = `<button  class="btn btn-danger" id="deleteButton">Delete</button>`;
    let closeButton = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
    modal.find('.modal-footer').append(deleteButton);
    modal.find('.modal-footer').append(closeButton);

    user.then(user => {
        console.log(user)
        let bodyForm = `
            <form class="form-group" id="deleteUser">
                <div class="form-group">
                  <label for="id"><b>ID</b></label>
                  <input type="text" class="form-control" id="id" value="${user.id}" readonly/>
                </div>
                <div class="form-group">
                  <label for="firstName1"><b>First Name</b></label>
                  <input type="text" class="form-control" id="firstName1" value="${user.firstName}" name="firstName" readonly/>
                </div>
                <div class="form-group">
                  <label for="lastName1"><b>Last Name</b></label>
                  <input type="text" class="form-control" id="lastName1" value="${user.lastName}" name="lastName" readonly/>
                </div>
                <div class="form-group">
                  <label class="form-label" for="age1"><b>Age</b></label>
                  <input type="number" id="age1" class="form-control" value="${user.age}" name="age" readonly/>
                </div>
                <div class="form-group">
                  <label for="username1"><b>Email</b></label>
                  <input type="text" class="form-control" id="username1" value="${user.username}" name="username" readonly/>
                </div>
                <div class="form-group">
                  <label for="password1"><b>Password</b></label>
                  <input type="password" class="form-control" id="password1" value"${user.password}" name="password" readonly/>
                </div>
                <div class="form-group">
                  <label for="role1"><b>Role</b></label>
                  <select size="2" multiple class="form-control" id="role1" readonly>
                    <option value="ROLE_USER">ROLE_USER</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </select>
                </div>
                </form>`
        modal.find('.modal-body').append(bodyForm);
    })


    $("#deleteButton").on('click', async () => {
        const response = await userFetchService.deleteUser(id).catch(error => console.log(error));

        if (response.ok) {
            getTableWithUsers();
            modal.modal('hide');
        } else {
            let body = await response.json();
            let alert = `<div class="alert alert-danger alert-dismissible fade show col-12" role="alert" id="Error">
                            ${body.info}
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`;
            modal.find('.modal-body').prepend(alert);
        }
    })
}

async function addNewUser() {
    let addUserForm = $('#addUserForm')
    let firstName = addUserForm.find("#firstNameAdd").val().trim();
    let lastName = addUserForm.find("#lastNameAdd").val().trim();
    let age = addUserForm.find("#ageAdd").val().trim();
    let username = addUserForm.find("#usernameAdd").val().trim();
    let password = addUserForm.find("#passwordAdd").val().trim();
    let roles = addUserForm.find("#roleAdd").val();
    let data = {
        firstName: firstName,
        lastName : lastName,
        age: age,
        username : username,
        password: password,
        roles: roles
    }

    const response = await userFetchService.addNewUser(data);

    if (response.ok) {


    } else {
        let body = await response.json();
        let alert = `<div class="alert alert-danger alert-dismissible fade show col-12" role="alert" id="Error">
                        ${body.info}
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>`;
        addUserForm.prepend(alert)
    }
}

async function getUserPage() {
    let table = $('#userTable tbody');
    table.empty();

    const authUserResponse = await userFetchService.findAuthUser();
    const user = authUserResponse.json();

    user.then(user => {
        let userRoles = "";
        for(let i = 0; i < user.roles.length; i++) {
            userRoles += user.roles[i].role;
            userRoles += " ";
        }
        console.log('auth_user', user)
        let temp = `<tr>
              <th scope="row">${user.id}</th>
              <td>${user.firstName}</td>
              <td>${user.lastName}</td>
              <td>${user.age}</td>
              <td>${user.username}</td>       
              <td>${userRoles.replace("ROLE_"," ")}</td>`
        table.append(temp)
    })
}

getTableWithUsers()
getDefaultModal()
$("#addUserButton").on('click', async () => {
    addNewUser()
})
$("#list-profile-list").on('click', async () => {
    getUserPage()
})