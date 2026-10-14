package com.medistock.controller;

import com.medistock.model.Medicine;
import com.medistock.repository.MedicineRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Medicine> getMedicineById(@PathVariable Long id) {
        return medicineRepository.findById(id);
    }

    @PostMapping
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @PutMapping("/{id}")
    public Medicine updateMedicine(@PathVariable Long id,
                                   @RequestBody Medicine medicineDetails) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        medicine.setName(medicineDetails.getName());
        medicine.setCategory(medicineDetails.getCategory());
        medicine.setBatchNumber(medicineDetails.getBatchNumber());
        medicine.setExpiryDate(medicineDetails.getExpiryDate());
        medicine.setPrice(medicineDetails.getPrice());
        medicine.setStock(medicineDetails.getStock());
        medicine.setSupplier(medicineDetails.getSupplier());
        medicine.setGenericName(medicineDetails.getGenericName());
        medicine.setManufacturer(medicineDetails.getManufacturer());
        medicine.setPurchasePrice(medicineDetails.getPurchasePrice());
        medicine.setReorderLevel(medicineDetails.getReorderLevel());
        medicine.setSellingPrice(medicineDetails.getSellingPrice());
        medicine.setStockQuantity(medicineDetails.getStockQuantity());

        return medicineRepository.save(medicine);
    }

    @DeleteMapping("/{id}")
    public String deleteMedicine(@PathVariable Long id) {
        medicineRepository.deleteById(id);
        return "Medicine deleted successfully";
    }
}