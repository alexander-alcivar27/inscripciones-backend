import { Test, TestingModule } from '@nestjs/testing';
import { NacionalidadesController } from './nacionalidades.controller';
import { NacionalidadesService } from './nacionalidades.service';

describe('NacionalidadesController', () => {
  let controller: NacionalidadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NacionalidadesController],
      providers: [NacionalidadesService],
    }).compile();

    controller = module.get<NacionalidadesController>(NacionalidadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
