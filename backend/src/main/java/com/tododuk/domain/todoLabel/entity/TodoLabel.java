package com.tododuk.domain.todoLabel.entity;

import com.tododuk.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class TodoLabel extends BaseEntity {
    @ManyToOne
    private Todo todo;
    @OneToMany
    private List<Label> label;


}
