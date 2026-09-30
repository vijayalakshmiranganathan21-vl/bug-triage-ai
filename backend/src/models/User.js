/**
 * User Model Schema Blueprint
 */
export const UserSchemaDefinition = {
  id: "String (UUID)",
  name: "String",
  email: "String",
  role: "Enum ['developer', 'qa', 'manager', 'admin']",
  team: "String",
  avatar: "String",
  active: "Boolean",
  createdAt: "Date",
};

export default UserSchemaDefinition;
