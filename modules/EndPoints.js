const systemRoles ={
    admin: 'admin',
    user: 'user',
};

const accessRoles = {
    admin: [systemRoles.admin],
    user: [systemRoles.user],
};

export default accessRoles;