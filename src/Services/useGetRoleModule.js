
import Axios from "axios";
import Constant from "../Components/Constant";
import { userDetails, permissonTypeList } from "../Services/authenticationService";
import loginUser from "./loginUser";

export default function useGetRoleModule(route) {
    let userDet = userDetails();
    let { accessToken } = loginUser();
    
    return new Promise((resolve, reject) => {
        Axios.get(
            Constant.apiBasePath +
            `admin/role/permission/details/${userDet?.partnerDetails[0]?._id}/${userDet?.roles?._id}`,
            { headers: { authkey: accessToken } }
        )
        .then(async (data) => {                      // <-- MAKE CALLBACK ASYNC
            if (!data.data.meta.status) {
                resolve({
                    moduleAccress: false,
                    moduleList: {},
                    message: `Module Need Some Permission...Pls contact with Your Admin`,
                    role: userDet.role
                });
                return;
            }

            let responseData = data.data.data;

            // Find permission for the selected route
            let permission =
                responseData?.formFields?.permission?.find(
                    (item) => item.label?.toLowerCase() === route?.toLowerCase()
                ) || {};

            if (!permission || !Array.isArray(permission.actions) || permission.actions.length === 0) {
                resolve({
                    moduleAccress: false,
                    moduleList: {},
                    message: `Module Need Some Permission...Pls contact with Your Admin`,
                    role: userDet.role,
                    accessType: ''
                });
                return;
            }

            // Access actions present in the module
            const actions = Array.isArray(permission.actions)
                ? permission.actions
                : [];

            // ⬇️ FIXED – WAIT FOR PERMISSION TYPE LIST
            const allPermissions = await permissonTypeList();   
            console.log("Final permissionTypes list:", allPermissions);

            // API returns array of { label, value }
            // So extract value properly
            const permissionKeys = allPermissions.value || [];

            const disabledFlags = Object.fromEntries(
                permissionKeys.map((perm) => [
                    `${perm}Disabled`,
                    !actions.includes(perm)
                ])
            );

            let updatedPermission = { ...disabledFlags };

            resolve({
                moduleAccress: true,
                moduleList: updatedPermission,
                message: "Module Allow To Access",
                role: userDet.role,
                accessType: permission.accessType || '',
                permissionKeys: actions
            });
        })
        .catch((err) => {
            if (err?.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
                return;
            }

            console.log("GET ROLE MODULE ERROR", err?.response);

            resolve({
                moduleAccress: false,
                moduleList: {},
                message: "Module In Catch Block"
            });
        });
    });
}

