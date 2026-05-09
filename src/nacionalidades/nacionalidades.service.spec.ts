import { Test, TestingModule } from '@nestjs/testing';
import { NacionalidadesService } from './nacionalidades.service';

describe('NacionalidadesService', () => {
  let service: NacionalidadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NacionalidadesService],
    }).compile();

    service = module.get<NacionalidadesService>(NacionalidadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
