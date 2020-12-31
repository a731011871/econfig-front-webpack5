import { Popo } from 'react-popo';
import { userModel } from './user';
import { productModel } from './product';
import { projectModel } from './project';
import { deptManagementModel } from './deptManagement';
import { roleModel } from './role';


const model = new Popo();

model.register(userModel);
model.register(productModel);
model.register(deptManagementModel);
model.register(roleModel);
model.register(projectModel);

const { PopoContainer, connect, store } = model.start();

export { PopoContainer };

export { connect };

export { store };


