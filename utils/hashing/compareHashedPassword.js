import bcrypt from "bcryptjs";

export const compareHashedPassword = (password,referenceData) => {
    return bcrypt.compareSync(password, referenceData);
};

// export const CompareHashedPassword = ({ payload = "", referenceData = "" }) => {
//     return bcrypt.compareSync(payload, referenceData);
// };