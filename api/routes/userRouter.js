
import { Router } from "express";
import {registerUser,userData,contactData,updateData,userNameData,updateOnlineStatus,creategroup
    ,fetchgroup
    ,searchgroup,joingroup,sendmessageingroup,fetchgroupmessage,userDataById,fetchgroupdetail
} from '../controller/userController.js'

const router=Router();

router.route('/register').post(registerUser);
router.route('/userdata').get(userData);
router.route('/userdatabyid').get(userDataById);
router.route('/contactdata').get(contactData);
router.route('/updatedata').post(updateData);

router.route('/username').get(userNameData);

router.route('/updateonline').post(updateOnlineStatus);
router.route('/creategroup').post(creategroup);
router.route('/fetchgroup').get(fetchgroup);
router.route('/searchgroup').get(searchgroup);
router.route('/joingroup').post(joingroup);
router.route('/sendmessageingroup').post(sendmessageingroup);
router.route('/fetchgroupmessage').get(fetchgroupmessage);

router.route('/fetchgroupdetail').get(fetchgroupdetail);

export default router;