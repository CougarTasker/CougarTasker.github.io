import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class ButtonSection extends Section{
  public ButtonSection(AR it) {
    super(it);
  }

  @Override
  JComponent getContents() {
    return null;
  }

  public JButton getAddButton(AR it) {
    JButton out = new JButton("add buttons");
    out.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.add(new ButtonSection(it));
      }
    });
    return out;
  }
}
